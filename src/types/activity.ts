export interface Activity {
    id: string;
    action: string;
    subject?: string;
    time: string;
    performingUser: string;
    performingUserRole: string;
    path: string;
    category?: 'project' | 'finance' | 'inventory' | 'role' | 'system';
    division?: string;
}
