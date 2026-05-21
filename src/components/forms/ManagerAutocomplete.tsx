import React, { useState, useEffect, useRef } from "react";
import { Search, User, ChevronDown, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";

interface Manager {
    id: string;
    name: string;
    email?: string;
    division: string;
    role?: string;
}

interface Props {
    value: string;
    onChange: (managerName: string, managerId?: string) => void;
    division?: string;
    placeholder?: string;
    className?: string;
}

export default function ManagerAutocomplete({ value, onChange, division, placeholder = "Search project manager...", className = "" }: Props) {
    const [suggestions, setSuggestions] = useState<Manager[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [ignoreDivision, setIgnoreDivision] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data: users = [] } = useQuery({
        queryKey: ["users", division, ignoreDivision],
        queryFn: () => userService.getUsers({
            sector: ignoreDivision ? undefined : (division === "all" ? undefined : division?.toUpperCase())
        }),
    });

    const allManagers = users.filter((u: any) => 
        u.role === "PROJECT_MANAGER" || u.role === "SUPER_ADMIN" || u.role === "ADMIN"
    );

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        setIgnoreDivision(false);
    }, [division]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getFilteredManagers = (searchVal: string, ignoreDiv: boolean) => {
        const isFiltering = searchVal.length > 0;
        const normalizedSearch = searchVal.toLowerCase();
        
        return allManagers.filter((m: any) => {
            const matchesSearch = !isFiltering || 
                (m.name?.toLowerCase()?.includes(normalizedSearch) || false) || 
                (m.email?.toLowerCase()?.includes(normalizedSearch) || false) || 
                String(m.id || "").toLowerCase().includes(normalizedSearch);
                
            const matchesDivision = ignoreDiv || !division || division === "all" || 
                m.division?.toLowerCase() === division?.toLowerCase() ||
                m.sector?.toLowerCase() === division?.toLowerCase();
            
            return matchesSearch && matchesDivision;
        });
    };

    const updateSuggestions = (searchVal: string, ignoreDiv: boolean) => {
        const filtered = getFilteredManagers(searchVal, ignoreDiv);
        setSuggestions(filtered.slice(0, 15) as Manager[]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
        
        if (val.length > 0) {
            updateSuggestions(val, ignoreDivision);
            setShowSuggestions(true);
        } else {
            updateSuggestions(val, ignoreDivision);
        }
    };

    const toggleDropdown = () => {
        if (!showSuggestions) {
            updateSuggestions(inputValue, ignoreDivision);
        }
        setShowSuggestions(!showSuggestions);
    };

    const handleFocus = () => {
        // If clicking on it, they expect a dropdown to appear
        updateSuggestions(inputValue, ignoreDivision);
        setShowSuggestions(true);
    };

    const handleSelect = (manager: Manager) => {
        setInputValue(manager.name);
        onChange(manager.name, manager.id);
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                />
                <button 
                    type="button"
                    onClick={toggleDropdown}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronDown size={18} className={`transition-transform duration-200 ${showSuggestions ? "rotate-180" : ""}`} />
                </button>
            </div>

            {showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((manager) => (
                                <button
                                    key={manager.id}
                                    type="button"
                                    onClick={() => handleSelect(manager)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{manager.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {manager.email || "No Email"} <span className="mx-1">•</span> <span className="uppercase">{manager.division || "N/A"}</span>
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center flex flex-col items-center">
                            <p className="text-sm font-medium text-slate-600 mb-1">
                                No project managers found.
                            </p>
                            <p className="text-xs text-slate-400 mb-4">
                                They might be assigned to a different sector.
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
