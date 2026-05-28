import React, { useState, useEffect, useRef } from "react";
import { clientService } from "../../services/clientService";
import { Search, ChevronDown, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    division: string;
    sector?: string;
    contactPerson?: string;
    companyName?: string;
}

interface Props {
    value: string;
    onChange: (clientName: string, clientId?: string, clientData?: any) => void;
    division?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function ClientAutocomplete({ value, onChange, division, placeholder = "Search client...", className = "", disabled = false }: Props) {
    const [suggestions, setSuggestions] = useState<Client[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [ignoreDivision, setIgnoreDivision] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data } = useQuery({
        queryKey: ["clients-list", division, ignoreDivision],
        queryFn: () => clientService.getClients({ 
            division: ignoreDivision ? undefined : (division === "all" ? undefined : division),
            limit: 500 // Get a good batch for autocomplete
        }),
    });

    const allClients = data?.data || [];

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        setIgnoreDivision(false);
    }, [division]);

    useEffect(() => {
        updateSuggestions(inputValue, ignoreDivision);
    }, [allClients, ignoreDivision]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getFilteredClients = (searchVal: string, ignoreDiv: boolean) => {
        const isFiltering = searchVal.length > 0;
        const normalizedSearch = searchVal.toLowerCase();
        
        return allClients.filter((c: any) => {
            // Only filter by search string if it's not the exact current value (meaning user is typing something new)
            const matchesSearch = !isFiltering || (inputValue === value && !showSuggestions) ||
                (c.name?.toLowerCase()?.includes(normalizedSearch) || false) || 
                (c.companyName?.toLowerCase()?.includes(normalizedSearch) || false) ||
                (c.contactPerson?.toLowerCase()?.includes(normalizedSearch) || false) ||
                (c.email?.toLowerCase()?.includes(normalizedSearch) || false) || 
                String(c.id || "").toLowerCase().includes(normalizedSearch);
                
            // When filtering by division/sector from User Management
            const matchesDivision = ignoreDiv || !division || division === "all" || 
                (c.division || c.sector || "").toUpperCase() === division?.toUpperCase() ||
                (c.division || c.sector || "").toLowerCase() === division?.toLowerCase();
            
            return matchesSearch && matchesDivision;
        });
    };

    const updateSuggestions = (searchVal: string, ignoreDiv: boolean) => {
        const filtered = getFilteredClients(searchVal, ignoreDiv);
        setSuggestions(filtered.slice(0, 15) as Client[]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
        updateSuggestions(val, ignoreDivision);
        setShowSuggestions(true);
    };

    const toggleDropdown = () => {
        if (!showSuggestions) {
            // If opening, show all clients in the current sector regardless of current input value
            const filtered = allClients.slice(0, 15);
            setSuggestions(filtered as Client[]);
        }
        setShowSuggestions(!showSuggestions);
    };

    const handleFocus = () => {
        // Show the current filtered list (likely full sector list if input is empty or matches current value)
        const filtered = getFilteredClients(inputValue === value ? "" : inputValue, ignoreDivision);
        setSuggestions(filtered.slice(0, 15) as Client[]);
        setShowSuggestions(true);
    };

    const handleSelect = (client: Client) => {
        const displayName = client.contactPerson && client.contactPerson !== "N/A" ? client.contactPerson : client.name;
        setInputValue(displayName);
        onChange(displayName, client.id, client);
        setShowSuggestions(false);
    };

    const handleShowAll = () => {
        setIgnoreDivision(true);
        updateSuggestions(inputValue, true);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm ${
                        disabled 
                            ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed font-medium" 
                            : "bg-white border-slate-200"
                    }`}
                />
                {!disabled && (
                    <button 
                        type="button"
                        onClick={toggleDropdown}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronDown size={18} className={`transition-transform duration-200 ${showSuggestions ? "rotate-180" : ""}`} />
                    </button>
                )}
            </div>

            {showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.length > 0 ? (
                        <>
                            {suggestions.map((client) => (
                                <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => handleSelect(client)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs uppercase">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate uppercase">
                                            {client.contactPerson && client.contactPerson !== "N/A" ? client.contactPerson : client.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">
                                            {client.contactPerson && client.contactPerson !== "N/A" ? `${client.name} • ` : ""} 
                                            {client.email || "No Email"} 
                                            <span className="mx-1">•</span> 
                                            <span className="uppercase font-bold text-brand-400/80">{client.division || client.sector || "N/A"}</span>
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="p-6 text-center flex flex-col items-center">
                            <p className="text-sm font-bold text-rose-500 mb-1">
                                No matching client found.
                            </p>
                            <p className="text-xs text-slate-400 mb-4 text-center px-4">
                                Please select from the dropdown suggestons. Simply typing a name does not link it to a record.
                            </p>
                            {!ignoreDivision && (
                                <button
                                    type="button"
                                    onClick={handleShowAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg text-sm font-semibold hover:bg-brand-100 transition-colors"
                                >
                                    <RefreshCw size={14} />
                                    Search All Sectors
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
