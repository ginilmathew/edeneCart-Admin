import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { ProtectedRoute } from "./components/auth";
import { AppLayout } from "./components/layout";
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import CreateOrder from "./pages/CreateOrder";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";
import AdminDashboard from "./pages/AdminDashboard";
import StaffManagement from "./pages/StaffManagement";
import StaffProfile from "./pages/StaffProfile";
import AdminOrderManagement from "./pages/AdminOrderManagement";
import ProductManagement from "./pages/ProductManagement";
import ExportData from "./pages/ExportData";

function LayoutWrapper() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <AppLayout user={user} onLogout={logout}>
      <Routes>
        {/* Staff routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <OrdersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/create"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <CreateOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminOrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/export"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ExportData />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user.role === "super_admin" ? "/admin" : "/"} replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <LayoutWrapper />
                </ProtectedRoute>
              }
            />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
