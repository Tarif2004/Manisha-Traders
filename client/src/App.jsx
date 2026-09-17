import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import OwnerDashboard from "./pages/OwnerDashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Admins from "./pages/Admins";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

function RootRedirect() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) return <Navigate to="/login" replace />;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/owner/dashboard" replace />;
    } catch {}
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/admin" element={<Register />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/register/customer" element={<Register />} />

        {/* ======================================================== */}
        {/* OWNER EXCLUSIVE ROUTES (role = owner only)               */}
        {/* ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route path="/owner" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admins" element={<Admins />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ======================================================== */}
        {/* ADMIN STAFF ROUTES (role = admin or owner)               */}
        {/* ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* DEFAULT FALLBACK */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;