import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { type DivisionId } from "../constants/divisions";

export type DocumentType = "QID" | "Passport" | "Contract";

export interface EmployeeDocument {
  type: DocumentType;
  number: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  division: DivisionId;
  role: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  documents: EmployeeDocument[];
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    expiringDocs: number;
    expiredDocs: number;
  };
  alerts: {
    employeeName: string;
    employeeId: string;
    docType: DocumentType;
    expiryDate: string;
    daysRemaining: number;
    isExpired: boolean;
  }[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const STORAGE_KEY = "trek_employees";

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Haseeb",
    phone: "9876543210",
    email: "haseeb@trekgroup.com",
    address: "Doha, Qatar",
    division: "CONTRACTING",
    role: "Engineer",
    status: "Active",
    joinedDate: "2024-01-15",
    documents: [
      {
        type: "QID",
        number: "123456789",
        issueDate: "2024-01-01",
        expiryDate: dayjs().add(15, "day").format("YYYY-MM-DD"),
      },
      {
        type: "Passport",
        number: "P987654",
        issueDate: "2022-05-01",
        expiryDate: "2027-05-01",
      }
    ]
  }
];

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
    } catch (err) {
      console.error("Failed to parse employees from localStorage", err);
      return MOCK_EMPLOYEES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (emp: Employee) => setEmployees(prev => [...prev, emp]);
  
  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const getEmployeeById = (id: string) => employees.find(emp => emp.id === id);

  const stats = useMemo(() => {
    const today = dayjs();
    let expiringCount = 0;
    let expiredCount = 0;

    employees.forEach(emp => {
      emp.documents.forEach(doc => {
        const expiry = dayjs(doc.expiryDate);
        if (expiry.isBefore(today, 'day')) {
          expiredCount++;
        } else if (expiry.diff(today, "day") <= 30) {
          expiringCount++;
        }
      });
    });

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === "Active").length,
      expiringDocs: expiringCount,
      expiredDocs: expiredCount,
    };
  }, [employees]);

  const alerts = useMemo(() => {
    const today = dayjs();
    const allAlerts: any[] = [];

    employees.forEach(emp => {
      emp.documents.forEach(doc => {
        const expiry = dayjs(doc.expiryDate);
        const diff = expiry.diff(today, "day");
        
        if (diff <= 30) {
          allAlerts.push({
            employeeName: emp.name,
            employeeId: emp.id,
            docType: doc.type,
            expiryDate: doc.expiryDate,
            daysRemaining: diff,
            isExpired: diff < 0
          });
        }
      });
    });

    return allAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [employees]);

  return (
    <EmployeeContext.Provider value={{ 
      employees, 
      addEmployee, 
      updateEmployee, 
      deleteEmployee, 
      getEmployeeById,
      stats,
      alerts
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
}
