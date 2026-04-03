import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAppDispatch } from "./store/hooks";
import {
  fetchProducts,
  fetchCategories,
  fetchOrders,
  fetchStaff,
  fetchStaffMe,
  fetchCustomers,
  fetchSettings,
} from "./store";
import { ApiLoadingOverlay } from "./components/ApiLoadingOverlay";
import { RootRoutes } from "./routes";

type ThemeMode = "light" | "dark";

function resolveTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem("eden_theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore storage read errors
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function DataLoader() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchOrders());
    void dispatch(fetchSettings());
    const p = user.permissions ?? [];
    if (user.role === "super_admin" || p.includes("staff.view")) {
      dispatch(fetchStaff());
    }
    if (user.role === "super_admin" || p.includes("customers.view")) {
      dispatch(fetchCustomers());
    }
    if (user.role === "staff" && user.staffId) {
      void dispatch(fetchStaffMe());
    }
  }, [dispatch, isAuthenticated, user]);
  return null;
}

function AppWithData() {
  return (
    <>
      <DataLoader />
      <RootRoutes />
    </>
  );
}

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => resolveTheme());

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      document.documentElement.setAttribute("data-theme", mode);
      document.documentElement.style.colorScheme = mode;
    };
    const sync = () => {
      const mode = resolveTheme();
      setThemeMode(mode);
      applyTheme(mode);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiLoadingOverlay />
        <AppWithData />
        <ToastContainer theme={themeMode} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
