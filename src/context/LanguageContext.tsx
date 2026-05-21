import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    invoices: "Invoices",
    expenses: "Expenses",
    clients: "Clients",
    approvals: "Approvals",
    search: "Search clients, invoices, jobs...",
    notifications: "Notifications",
    logout: "Sign Out",
    welcome: "Welcome",
    total_receivables: "Total Receivables",
    total_payables: "Total Payables",
    active_projects: "Active Projects",
    add_expense: "Add New Expense",
    add_client: "Add Client",
    language: "Language"
  },
  ar: {
    dashboard: "لوحة القيادة",
    projects: "المشاريع",
    invoices: "الفواتير",
    expenses: "المصاريف",
    clients: "العملاء",
    approvals: "الموافقات",
    search: "البحث عن العملاء، الفواتير، الوظائف...",
    notifications: "التنبيهات",
    logout: "تسجيل الخروج",
    welcome: "أهلاً بك",
    total_receivables: "إجمالي المستحقات",
    total_payables: "إجمالي المدفوعات",
    active_projects: "المشاريع النشطة",
    add_expense: "إضافة مصاريف جديدة",
    add_client: "إضافة عميل",
    language: "اللغة"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language] = useState<Language>("en");

  useEffect(() => {
    localStorage.removeItem("trek_lang");
    // Handle RTL
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
