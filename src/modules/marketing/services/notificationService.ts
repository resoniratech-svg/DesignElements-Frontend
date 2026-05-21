import type { MarketingNotification } from '../types';
import { leadService } from '../../../services/leadService';
import dayjs from 'dayjs';

const STORAGE_KEY_READ_NOTIFS = 'trek_marketing_read_notifications';

const getReadNotificationIds = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY_READ_NOTIFS);
  return stored ? JSON.parse(stored) : [];
};

const saveReadNotificationId = (id: string) => {
  const readIds = getReadNotificationIds();
  if (!readIds.includes(id)) {
    localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify([...readIds, id]));
  }
};

export const notificationService = {
  getNotifications: async (): Promise<MarketingNotification[]> => {
    const leads = await leadService.getLeads();
    if (!leads) return [];
    
    const readIds = getReadNotificationIds();
    const notifications: MarketingNotification[] = [];
    const today = dayjs().startOf('day');

    (Array.isArray(leads) ? (leads as any[]) : []).forEach(lead => {
      // 1. Follow-up Reminders
      if (lead.nextFollowUpDate && lead.status !== 'Converted') {
        const followUpDate = dayjs(lead.nextFollowUpDate);
        if (followUpDate.isSameOrBefore(today, 'day')) {
            const id = `reminder-${lead.id}-${lead.nextFollowUpDate}`;
            notifications.push({
                id,
                title: 'Follow-up Reminder',
                message: `Follow up due for ${lead.name}${followUpDate.isBefore(today, 'day') ? ' (Overdue)' : ''}`,
                type: 'reminder',
                timestamp: new Date().toISOString(), // Mocking timestamp for now
                isRead: readIds.includes(id),
                leadId: lead.id
            });
        }
      }

      // 2. Admin Alerts for New Leads
      if (lead.status === 'New') {
          const id = `new-lead-${lead.id}`;
          notifications.push({
              id,
              title: 'Admin Alert',
              message: `New lead assigned: ${lead.name}`,
              type: 'admin',
              timestamp: lead.createdAt || new Date().toISOString(),
              isRead: readIds.includes(id),
              leadId: lead.id
          });
      }
    });

    // Sort by type (reminders first) then by status
    return notifications.sort((a, b) => {
        if (a.type === 'reminder' && b.type !== 'reminder') return -1;
        if (a.type !== 'reminder' && b.type === 'reminder') return 1;
        return (a.isRead === b.isRead) ? 0 : (a.isRead ? 1 : -1);
    });
  },
  markAsRead: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    saveReadNotificationId(id);
  }
};
