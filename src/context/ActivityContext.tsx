import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Activity } from '../types/activity';
import { useAuth } from './AuthContext';

// Define the context state
interface ActivityContextType {
    activities: Activity[];
    logActivity: (
        action: string,
        category: Activity['category'],
        path: string,
        subject?: string,
        performingUser?: string,
        performingUserRole?: string
    ) => void;
    clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>(() => {
        try {
            const stored = localStorage.getItem('trek_activities');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to parse activities from local storage", error);
            return [];
        }
    });

    const logActivity = useCallback((
        action: string,
        category: Activity['category'],
        path: string,
        subject?: string,
        performingUser?: string,
        performingUserRole?: string
    ) => {
        const newActivity: Activity = {
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            category,
            path,
            subject,
            time: new Date().toISOString(),
            performingUser: performingUser || user?.name || 'Admin',
            performingUserRole: performingUserRole || user?.role || 'SUPER_ADMIN'
        };

        setActivities(prev => {
            const updated = [newActivity, ...prev];
            const truncated = updated.slice(0, 100);
            localStorage.setItem('trek_activities', JSON.stringify(truncated));
            return truncated;
        });
    }, [user]); // Added user to dependencies

    const clearActivities = useCallback(() => {
        setActivities([]);
        localStorage.removeItem('trek_activities');
    }, []);

    return (
        <ActivityContext.Provider value={{ activities, logActivity, clearActivities }}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    const context = useContext(ActivityContext);
    if (context === undefined) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
}
