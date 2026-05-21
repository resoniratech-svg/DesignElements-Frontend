import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { DivisionId } from "../constants/divisions";
import { useAuth } from "./AuthContext";

interface DivisionContextType {
  activeDivision: DivisionId | "all";
  setActiveDivision: (id: DivisionId | "all") => void;
  canSwitchDivision: boolean;
}

const DivisionContext = createContext<DivisionContextType | undefined>(undefined);

export function DivisionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [activeDivision, setActiveDivision] = useState<DivisionId | "all">(() => {
    const stored = localStorage.getItem("trek_active_division");
    // Standardize saved value if it exists or use default
    if (stored === "all") return "all";
    if (stored?.toLowerCase() === "trading") return "TRADING";
    if (stored?.toLowerCase() === "contracting") return "CONTRACTING";
    return (stored as DivisionId | "all") || "all";
  });

  // If user has a locked division and is NOT an admin/client, force it
  useEffect(() => {
    if (user?.division && user?.role !== "SUPER_ADMIN" && user?.role !== "CLIENT") {
      // Normalize user division if stored as lowercase in backend
      const normalized = user.division.toUpperCase() as DivisionId;
      setActiveDivision(normalized);
    }
  }, [user?.division, user?.role]);

  useEffect(() => {
    localStorage.setItem("trek_active_division", activeDivision);
  }, [activeDivision]);

  const canSwitchDivision = useMemo(() => {
    // Only SUPER_ADMIN can switch between divisions
    // CLIENT, ACCOUNTS and PROJECT_MANAGER users should never see sector tabs
    if (user?.role === "ACCOUNTS" || user?.role === "PROJECT_MANAGER") {
      return false;
    }
    return user?.role === "SUPER_ADMIN" || !user?.division;
  }, [user]);

  return (
    <DivisionContext.Provider value={{ activeDivision, setActiveDivision, canSwitchDivision }}>
      {children}
    </DivisionContext.Provider>
  );
}

export function useDivision() {
  const context = useContext(DivisionContext);
  if (!context) {
    throw new Error("useDivision must be used within a DivisionProvider");
  }
  return context;
}
