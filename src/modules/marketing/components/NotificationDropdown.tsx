import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { notificationService } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, setNotifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    };
    fetchNotifications();
  }, [setNotifications]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleNotificationClick = (id: string, leadId?: string) => {
    markAsRead(id);
    notificationService.markAsRead(id);
    if (leadId) {
      navigate(`/marketing/leads/${leadId}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.leadId)}
                    className={`p-4 hover:bg-blue-50/30 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/10' : ''}`}
                  >
                    <div className={`mt-1 p-2 rounded-lg shrink-0 ${n.type === 'reminder' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {n.type === 'reminder' ? <Clock size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                        {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">Just now</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                <MessageSquare className="text-gray-200" size={40} />
                <p className="text-sm italic">All caught up! No notifications.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-50 text-center">
            <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
              View Notification History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
