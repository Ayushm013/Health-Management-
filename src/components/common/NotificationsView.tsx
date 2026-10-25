import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Pill,
  FileCheck2,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Notification } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

interface NotificationsViewProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationsCount } = useAuth();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      const list = res.notifications || [];
      setNotifications(list);
      setUnreadNotificationsCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      alert('Unable to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (err) {
      alert('Unable to mark all notifications as read.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      await loadNotifications();
    } catch (err) {
      alert('Unable to delete notification.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
      case 'appointment_confirmation':
      case 'appointment_cancellation':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'medication_reminder':
        return <Pill className="w-4 h-4 text-sky-600" />;
      case 'new_prescription':
        return <FileCheck2 className="w-4 h-4 text-indigo-600" />;
      case 'medical_report_uploaded':
        return <FileText className="w-4 h-4 text-violet-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notification Center & Reminders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical appointment alerts, medication dosing reminders, and diagnostic updates
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors self-start sm:self-center"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">You're all caught up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No pending reminders. Upcoming medication doses and clinic confirmations will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.isRead ? 'bg-white' : 'bg-teal-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notif.link && onNavigate && (
                      <button
                        onClick={() => {
                          handleMarkRead(notif.id);
                          const route = (notif.link || '').replace('/', '');
                          onNavigate(route);
                        }}
                        className="text-teal-700 hover:underline font-semibold font-sans"
                      >
                        Open related item →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 text-teal-700 hover:bg-teal-100/60 rounded-md transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
