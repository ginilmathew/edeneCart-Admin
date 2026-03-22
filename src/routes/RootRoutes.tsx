import { Routes, Route, Navigate, useLocation } from "react-router";
import { ProtectedRoute } from "../components/auth";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/layout";
import { LayoutRoutes } from "./LayoutRoutes";
import Login from "../pages/Login";

function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;
  if (
    user.mustChangePassword &&
    location.pathname !== "/account/password"
  ) {
    return <Navigate to="/account/password" replace />;
  }
  return (
    <AppLayout user={user} onLogout={logout}>
      <LayoutRoutes user={user} />
    </AppLayout>
  );
}

export function RootRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
