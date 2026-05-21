import { sidebarMenu, type SidebarSection } from "../config/sidebarMenu";
import type { Role } from "../types/user";

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

export function saveDynamicPermissions(permissions: PermissionsData) {
    localStorage.setItem("trek_permissions", JSON.stringify(permissions));
    // Dispatch a custom event so the Sidebar re-renders immediately
    window.dispatchEvent(new Event(PERMISSIONS_CHANGED_EVENT));
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
