import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles = ["owner", "admin"], requiredPermission = null }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      // Block suspended or unapproved accounts
      if (user.status === "suspended" || user.status === "pending" || user.status === "rejected") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
      }

      // Role authorization
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (user.role === "admin") {
          return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === "owner") {
          return <Navigate to="/owner/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
      }

      // Granular permission check for admin
      if (requiredPermission && user.role === "admin") {
        if (!user.permissions || !user.permissions[requiredPermission]) {
          return <Navigate to="/admin/dashboard" replace />;
        }
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
