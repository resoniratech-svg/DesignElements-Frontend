import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/user";
import { getAuthorizedSidebarSections } from "../utils/permissions";

interface Props {
  allowedRoles?: Role[];
  requiredSections?: string[];
}

export default function ProtectedRoute({ allowedRoles, requiredSections }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredSections && requiredSections.length > 0) {
    // SUPER_ADMIN has broad access, but we still filter by authorizedSections 
    // to respect the manual removals (like Inventory)
    const authorizedSections = getAuthorizedSidebarSections(user.role);
    
    // User Management is always open for SUPER_ADMIN
    if (user.role === "SUPER_ADMIN" && requiredSections.includes("User Management")) {
      return <Outlet />;
    }

    const hasAccess = requiredSections.some(sec =>
      authorizedSections.some(s => s.section === sec)
    );
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}