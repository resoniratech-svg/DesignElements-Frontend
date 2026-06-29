import { sidebarMenu, type SidebarSection } from "../config/sidebarMenu";
import type { Role } from "../types/user";
import apiClient from "../api/client";

export interface PermissionsData {
    [sectionName: string]: Role[];
}

export async function fetchAndSyncPermissions(): Promise<PermissionsData> {
    try {
        const response = await apiClient.get("/permissions");
        return response.data.data as PermissionsData;
    } catch (error) {
        console.error("Failed to fetch permissions from database:", error);
        return {};
    }
}

export async function saveDynamicPermissions(permissions: PermissionsData): Promise<boolean> {
    try {
        await apiClient.put("/permissions", permissions);
        return true;
    } catch (error) {
        console.error("Failed to save permissions to database:", error);
        throw error;
    }
}

export function getAuthorizedSidebarSections(
    userRole: Role | undefined, 
    permissions: PermissionsData
): SidebarSection[] {
    if (!userRole) return [];

    const hasSavedPermissions = Object.keys(permissions).length > 0;

    return sidebarMenu.filter((section) => {
        // "User Management" is always visible to SUPER_ADMIN (so they can't lock themselves out)
        if (userRole === "SUPER_ADMIN" && section.section === "User Management") {
            return true;
        }

        // If dynamic permissions have been saved, use those for ALL roles
        if (hasSavedPermissions && permissions[section.section]) {
            return permissions[section.section].includes(userRole);
        }

        // Otherwise fall back to the defaults defined in sidebarMenu.ts
        return section.roles.includes(userRole);
    });
}
