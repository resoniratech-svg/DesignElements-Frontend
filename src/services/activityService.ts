
/**
 * Activity Service
 * Handles logging of user actions across the system for the Audit Trail.
 */

export interface ActivityLog {
  id: string;
  action: string;
  subject?: string;
  performingUser: string;
  time: string; // ISO string
  division?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "trek_activities";

export const activityService = {
  getActivities: (): ActivityLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse activities", e);
      return [];
    }
  },

  logActivity: (
    action: string, 
    subject?: string, 
    path?: string, 
    division?: string, 
    metadata?: Record<string, unknown>
  ): ActivityLog | null => {
    try {
      const activities = activityService.getActivities();
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
      
      const newActivity: ActivityLog = {
        id: `ACT-${Date.now()}`,
        action,
        subject,
        performingUser: currentUser.name || "System",
        time: new Date().toISOString(),
        path,
        division,
        metadata
      };

      const updatedActivities = [newActivity, ...activities].slice(0, 50); // Keep last 50 logs
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));
      
      // Dispatch a custom event so components can listen for updates if they don't use React Query
      window.dispatchEvent(new CustomEvent("activity_logged", { detail: newActivity }));
      
      return newActivity;
    } catch (e) {
      console.error("Failed to log activity", e);
      return null;
    }
  },

  clearActivities: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
