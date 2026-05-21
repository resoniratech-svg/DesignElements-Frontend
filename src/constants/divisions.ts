export const DIVISIONS = [

  {
    id: "TRADING",
    label: "Trading Sector",
    icon: "📦",
    color: "#f59e0b", // Amber/Orange
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    taxRate: 0,
  },
  {
    id: "CONTRACTING",
    label: "Contracting Sector",
    icon: "🏗️",
    color: "#8b5cf6", // Violet
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    taxRate: 5, // Default Qatar VAT 5% (if applicable)
  },
] as const;

export type DivisionId = (typeof DIVISIONS)[number]["id"];

export interface Division {
  id: DivisionId;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  taxRate: number;
}

export const getDivisionById = (id: string) => DIVISIONS.find((d) => d.id === id?.toUpperCase()) || DIVISIONS[0];
