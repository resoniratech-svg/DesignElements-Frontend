import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { authService } from "../services/authService";
import { fetchAndSyncPermissions, type PermissionsData } from "../utils/permissions";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  permissions: PermissionsData;
  refreshPermissions: () => Promise<PermissionsData>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [permissions, setPermissions] = useState<PermissionsData>({});

  const refreshPermissions = useCallback(async () => {
    try {
      const data = await fetchAndSyncPermissions();
      setPermissions(data);
      return data;
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      return {};
    }
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Persist JWT token separately for the Axios interceptor
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("API logout failed", e);
    }
    setUser(null);
    setPermissions({});
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  // Sync permissions from database when authenticated
  useEffect(() => {
    if (user) {
      refreshPermissions();
    } else {
      setPermissions({});
    }
  }, [user, refreshPermissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        permissions,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};