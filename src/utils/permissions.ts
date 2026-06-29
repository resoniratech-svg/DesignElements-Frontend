import { sidebarMenu, type SidebarSection } from "../config/sidebarMenu";
import type { Role } from "../types/user";
import apiClient from "../api/client";

export interface PermissionsData {
    [sectionName: string]: Role[];
}

// Custom event name for permission changes
export const PERMISSIONS_CHANGED_EVENT = "trek_permissions_changed";

export function getDynamicPermissions(): PermissionsData {
    try {
        const data = localStorage.getItem("trek_permissions");
        if (data) {
            return JSON.parse(data) as PermissionsData;
        }
    } catch (error) {
        console.error("Failed to parse permissions", error);
    }
    return {};
}

export async function fetchAndSyncPermissions(): Promise<PermissionsData> {
    try {
        const response = await apiClient.get("/permissions");
        const permissions = response.data.data as PermissionsData;
        localStorage.setItem("trek_permissions", JSON.stringify(permissions));
        // Trigger sidebar update
        window.dispatchEvent(new Event(PERMISSIONS_CHANGED_EVENT));
        return permissions;
    } catch (error) {
        console.error("Failed to fetch permissions from database:", error);
        return getDynamicPermissions(); // fallback to local cache
    }
}

export async function saveDynamicPermissions(permissions: PermissionsData): Promise<boolean> {
    try {
        // Update local storage immediately for instant UI feedback
        localStorage.setItem("trek_permissions", JSON.stringify(permissions));
        window.dispatchEvent(new Event(PERMISSIONS_CHANGED_EVENT));

        // Sync with PostgreSQL database
        await apiClient.put("/permissions", permissions);
        return true;
    } catch (error) {
        console.error("Failed to save permissions to database:", error);
        throw error;
    }
}

export function getAuthorizedSidebarSections(userRole: Role | undefined): SidebarSection[] {
    if (!userRole) return [];

    const dynamicPermissions = getDynamicPermissions();
    const hasSavedPermissions = Object.keys(dynamicPermissions).length > 0;

    return sidebarMenu.filter((section) => {
        // "User Management" is always visible to SUPER_ADMIN (so they can't lock themselves out)
        if (userRole === "SUPER_ADMIN" && section.section === "User Management") {
            return true;
        }


        // If dynamic permissions have been saved, use those for ALL roles
        if (hasSavedPermissions && dynamicPermissions[section.section]) {
            return dynamicPermissions[section.section].includes(userRole);
        }

        // Otherwise fall back to the defaults defined in sidebarMenu.ts
        return section.roles.includes(userRole);
    });
}
