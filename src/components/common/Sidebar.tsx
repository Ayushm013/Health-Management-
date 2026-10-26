import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Users,
  FileText,
  FileCheck2,
  Pill,
  LineChart,
  Target,
  Sparkles,
  MessageSquare,
  Bell,
  LogOut,
  ShieldCheck,
  History,
  HeartPulse,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = true, onClose }) => {
  const { user, role, logout, unreadNotificationsCount } = useAuth();

  if (!user) return null;

  const patientNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Health Profile', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileCheck2 },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'metrics', label: 'Health Metrics', icon: LineChart },
    { id: 'goals', label: 'Health Goals', icon: Target },
    { id: 'wellness', label: 'Daily Wellness', icon: HeartPulse },
    { id: 'messages', label: 'Doctor Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount }
  ];

  const doctorNav = [
    { id: 'dashboard', label: 'Consultation Queue', icon: LayoutDashboard },
    { id: 'profile', label: 'Doctor Profile', icon: UserCheck },
    { id: 'appointments', label: 'Appointment Schedule', icon: Calendar },
    { id: 'patients', label: 'Authorized Patients', icon: Users },
    { id: 'prescriptions', label: 'Prescription Desk', icon: FileCheck2 },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'messages', label: 'Patient Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount }
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'admin-panel', label: 'Master Admin Panel', icon: Sparkles },
    { id: 'appointments', label: 'All Appointments', icon: Calendar },
    { id: 'records', label: 'All Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'All Prescriptions', icon: FileCheck2 },
    { id: 'patients-control', label: 'Patient Descriptions', icon: Users },
    { id: 'users', label: 'User Directory', icon: UserCheck },
    { id: 'doctors', label: 'Doctor Verification', icon: ShieldCheck },
    { id: 'audit', label: 'Security Audit Logs', icon: History }
  ];

  let items = patientNav;
  if (role === 'doctor') items = doctorNav;
  else if (role === 'admin') items = adminNav;

  return (
    <aside
      className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Role Indicator Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <img
            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d9488&color=fff`}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-teal-400 capitalize font-medium">{user.role} Account</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-teal-800' : 'bg-teal-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
