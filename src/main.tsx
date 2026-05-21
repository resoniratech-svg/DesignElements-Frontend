import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ActivityProvider } from "./context/ActivityContext";
import { DivisionProvider } from "./context/DivisionContext";
import { ApprovalProvider } from "./context/ApprovalContext";
import { LanguageProvider } from "./context/LanguageContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import { seedDataIfEmpty } from "./utils/seedData";
import "./index.css";

// Ensure initial data exists for the dashboards
const MIGRATION_VERSION = "1.1";
if (localStorage.getItem("trek_mkt_version") !== MIGRATION_VERSION) {
    localStorage.removeItem("trek_marketing_leads");
    localStorage.removeItem("trek_marketing_read_notifications");
    localStorage.setItem("trek_mkt_version", MIGRATION_VERSION);
}
seedDataIfEmpty();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ActivityProvider>
          <DivisionProvider>
            <ApprovalProvider>
              <LanguageProvider>
                <EmployeeProvider>
                  <App />
                </EmployeeProvider>
              </LanguageProvider>
            </ApprovalProvider>
          </DivisionProvider>
        </ActivityProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);