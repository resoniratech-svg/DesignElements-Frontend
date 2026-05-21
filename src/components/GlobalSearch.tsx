import { Search, User, FileText, Briefcase, Receipt, X, Folder } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "invoice" | "job" | "expense" | "employee" | "project";
  route: string;
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // 1. Search Clients
    try {
      const clients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
      clients.filter((c: any) => 
        (c.name || "").toLowerCase().includes(q) || 
        (c.email || "").toLowerCase().includes(q) ||
        (c.clientId || "").toLowerCase().includes(q)
      ).slice(0, 2).forEach((c: any) => {
        allResults.push({
          id: c.id || c.clientId,
          title: c.name,
          subtitle: `Client ID: ${c.clientId}`,
          type: "client",
          route: `/client-details/${c.id || c.clientId}`
        });
      });
    } catch (e) {}

    // 2. Search Invoices
    try {
      const invoices = JSON.parse(localStorage.getItem("trek_invoices") || "[]");
      invoices.filter((inv: any) => 
        (inv.invoiceNo || "").toLowerCase().includes(q) || 
        (inv.client || "").toLowerCase().includes(q)
      ).slice(0, 2).forEach((inv: any) => {
        allResults.push({
          id: inv.invoiceNo,
          title: `Invoice ${inv.invoiceNo}`,
          subtitle: `${inv.client} — QAR ${inv.amount?.toLocaleString()}`,
          type: "invoice",
          route: `/invoice-details/${inv.id}`
        });
      });
    } catch (e) {}

    // 3. Search Employees
    try {
      const employees = JSON.parse(localStorage.getItem("trek_employees") || "[]");
      employees.filter((emp: any) => 
        (emp.name || "").toLowerCase().includes(q) || 
        (emp.employeeId || "").toLowerCase().includes(q) ||
        (emp.designation || "").toLowerCase().includes(q)
      ).slice(0, 2).forEach((emp: any) => {
        allResults.push({
          id: emp.employeeId,
          title: emp.name,
          subtitle: `${emp.designation} — ${emp.employeeId}`,
          type: "employee",
          route: `/employees/details/${emp.id}`
        });
      });
    } catch (e) {}

    // 4. Search Projects
    try {
      const projects = JSON.parse(localStorage.getItem("trek_projects") || "[]");
      projects.filter((p: any) => 
        (p.name || "").toLowerCase().includes(q) || 
        (p.client || "").toLowerCase().includes(q)
      ).slice(0, 2).forEach((p: any) => {
        allResults.push({
          id: p.id,
          title: p.name,
          subtitle: `Client: ${p.client} — ${p.status}`,
          type: "project",
          route: `/projects`
        });
      });
    } catch (e) {}

    setResults(allResults);
  }, [query]);

  // Handle Enter Key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  // Handle outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    navigate(result.route);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "client": return <User size={14} className="text-blue-500" />;
      case "invoice": return <FileText size={14} className="text-emerald-500" />;
      case "job": return <Briefcase size={14} className="text-amber-500" />;
      case "expense": return <Receipt size={14} className="text-rose-500" />;
      case "employee": return <User size={14} className="text-violet-500" />;
      case "project": return <Folder size={14} className="text-brand-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center bg-surface-muted border border-gray-100 px-4 py-2 rounded-lg w-64 md:w-80 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50 transition-all">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search clients, invoices, jobs..."
          className="bg-transparent outline-none px-3 text-sm w-full text-gray-700 placeholder:text-gray-400"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-down">
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100/50">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Search Results
            </span>
          </div>

          <ul className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
            {results.length > 0 ? (
              results.map((result) => (
                <li
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="px-4 py-3 hover:bg-brand-50/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{result.title}</p>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{result.subtitle}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center">
                <p className="text-xs text-slate-400 font-medium italic">No results found for "{query}"</p>
              </li>
            )}
          </ul>

          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/30">
              <p className="text-[10px] text-slate-400 text-center font-medium">
                Press Enter to view all results
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
