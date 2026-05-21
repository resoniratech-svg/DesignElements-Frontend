import dayjs from 'dayjs';

const STORAGE_KEYS = {
  PROJECTS: 'trek_projects',
  JOBS: 'trek_jobs',
  INVOICES: 'trek_invoices',
  EXPENSES: 'trek_expenses',
  CLIENTS: 'trek_clients',
  ACTIVITIES: 'trek_activities',
  LEADS: 'trek_marketing_leads',
  PRO_TASKS: 'trek_pro_tasks',
  PRO_CONTRACTS: 'trek_pro_contracts',
  PRO_QUOTATIONS: 'trek_pro_quotations',
};

const SEED_DATA = {
  [STORAGE_KEYS.PROJECTS]: [
    { id: 'PRJ-2026-001', name: 'Al-Rayyan Tower Refurbishment', client: 'Al-Rayyan Properties', status: 'Active', division: 'contracting', startDate: '2026-01-10', budget: 1250000 },
    { id: 'PRJ-2026-002', name: 'Lusail Marina Interior Design', client: 'Q-Tech Logistics', status: 'Ongoing', division: 'trading', startDate: '2026-02-15', budget: 450000 },
    { id: 'PRJ-2026-003', name: 'West Bay Office Fit-out', client: 'Global KM Net', status: 'Completed', division: 'contracting', startDate: '2025-11-01', budget: 850000 },
    { id: 'PRJ-2026-004', name: 'Pearl Qatar Landscaping', client: 'Private Villa', status: 'Active', division: 'trading', startDate: '2026-03-01', budget: 120000 },
  ],
  [STORAGE_KEYS.JOBS]: [
    { jobId: 'JOB-501', project: 'Al-Rayyan Tower Refurbishment', clientName: 'Al-Rayyan Properties', status: 'Ongoing', dueDate: '2026-04-15', division: 'contracting' },
    { jobId: 'JOB-502', project: 'Lusail Marina Interior Design', clientName: 'Q-Tech Logistics', status: 'Completed', dueDate: '2026-03-20', division: 'trading' },
    { jobId: 'JOB-503', project: 'West Bay Office Fit-out', clientName: 'Global KM Net', status: 'Overdue', dueDate: '2026-03-25', division: 'contracting' },
    { jobId: 'JOB-504', project: 'Pearl Qatar Landscaping', clientName: 'Private Villa', status: 'Ongoing', dueDate: '2026-05-10', division: 'trading' },
  ],
  [STORAGE_KEYS.INVOICES]: [
    { id: 'INV-2026-101', invoiceNo: 'INV/2026/0101', client: 'Al-Rayyan Properties', amount: 45000, status: 'Pending', date: '2026-03-15', branch: 'contracting' },
    { id: 'INV-2026-102', invoiceNo: 'INV/2026/0102', client: 'Q-Tech Logistics', amount: 15500, status: 'Paid', date: '2026-02-28', branch: 'trading' },
    { id: 'INV-2026-103', invoiceNo: 'INV/2026/0103', client: 'Global KM Net', amount: 8400, status: 'Overdue', date: '2026-03-01', branch: 'contracting' },
    { id: 'INV-2026-104', invoiceNo: 'INV/2026/0104', client: 'Private Villa', amount: 12000, status: 'Pending', date: '2026-03-20', branch: 'trading' },
  ],
  [STORAGE_KEYS.EXPENSES]: [
    { id: 'EXP-901', amount: 5000, status: 'Paid', date: '2026-03-10', division: 'contracting', referenceType: 'contracting' },
    { id: 'EXP-902', amount: 2500, status: 'Pending', date: '2026-03-18', division: 'trading', referenceType: 'trading' },
    { id: 'EXP-903', amount: 1200, status: 'Paid', date: '2026-02-15', division: 'trading', referenceType: 'trading' },
  ],
  [STORAGE_KEYS.CLIENTS]: [
    { id: 'CLI-001', name: 'Al-Rayyan Properties', crNumber: 'CR-10022', computerCard: 'CC-9901', renewalDate: '2026-12-31' },
    { id: 'CLI-002', name: 'Q-Tech Logistics', crNumber: 'CR-44556', computerCard: 'CC-8822', renewalDate: '2026-11-15' },
    { id: 'CLI-003', name: 'Global KM Net', crNumber: 'CR-77889', computerCard: 'CC-3344', renewalDate: '2026-06-30' },
  ],
  [STORAGE_KEYS.LEADS]: [
    { id: 'L-001', name: 'Sameer Deep', email: 'sameer.deep@example.ae', source: 'LinkedIn', status: 'New', priority: 'High', createdAt: dayjs().subtract(1, 'day').toISOString(), nextFollowUpDate: dayjs().format('YYYY-MM-DD') },
    { id: 'L-002', name: 'Sarah Rahman', email: 'sarah.r@techsolutions.com', source: 'Website', status: 'Follow-up', priority: 'Medium', createdAt: dayjs().subtract(3, 'day').toISOString(), nextFollowUpDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
    { id: 'L-003', name: 'Michael Chen', email: 'm.chen@globalkm.net', source: 'Referral', status: 'Converted', priority: 'Low', createdAt: dayjs().subtract(10, 'day').toISOString(), nextFollowUpDate: '' },
    { id: 'L-004', name: 'Amara Okafor', email: 'amara.okafor@africabiz.com', source: 'Google Ads', status: 'Pending', priority: 'High', createdAt: dayjs().subtract(2, 'day').toISOString(), nextFollowUpDate: dayjs().add(2, 'day').format('YYYY-MM-DD') },
  ],
};

export const seedDataIfEmpty = () => {
    Object.entries(SEED_DATA).forEach(([key, data]) => {
        if (!localStorage.getItem(key)) {
            console.log(`[SEED] Seeding ${key} with initial data.`);
            localStorage.setItem(key, JSON.stringify(data));
        }
    });

    // Seed activities if empty
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
        const initialActivities = [
            { id: 'a1', action: 'Created new project', category: 'project', path: '/projects', subject: 'Al-Rayyan Tower', time: dayjs().subtract(2, 'hour').toISOString(), performingUser: 'Admin User', performingUserRole: 'SUPER_ADMIN', division: 'contracting' },
            { id: 'a2', action: 'Approved Invoice', category: 'finance', path: '/invoices', subject: 'INV/2026/0102', time: dayjs().subtract(1, 'day').toISOString(), performingUser: 'Accounts Manager', performingUserRole: 'ACCOUNTS', division: 'trading' },
            { id: 'a3', action: 'New Lead generated', category: 'marketing', path: '/marketing/leads', subject: 'Sameer Deep', time: dayjs().subtract(3, 'day').toISOString(), performingUser: 'System', performingUserRole: 'SYSTEM', division: 'trading' },
        ];
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
    }
};
