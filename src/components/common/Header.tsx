import React, { useState } from 'react';
import { Activity, Bell, User as UserIcon, LogOut, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext.js';

interface HeaderProps {
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isDashboard?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  activeTab,
  setActiveTab,
  isDashboard = false
}) => {
  const { user, role, logout, switchDemoUser, unreadNotificationsCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              if (setActiveTab) {
                e.preventDefault();
                setActiveTab('landing');
              }
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  Arogya<span className="text-teal-600">Pulse</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                  ABDM
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                आरोग्य पल्स • Unified Health
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links (single line, no wrapping) */}
        {!isDashboard ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="/"
              onClick={(e) => {
                if (setActiveTab) {
                  e.preventDefault();
                  setActiveTab('landing');
                }
              }}
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#about"
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
            <a
              href="#departments"
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              Departments
            </a>
            <a
              href="#doctors"
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              Doctors
            </a>
            <a
              href="#features"
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              Services
            </a>
            <button
              type="button"
              onClick={() => {
                if (user && setActiveTab) {
                  setActiveTab('appointments');
                } else if (onOpenAuth) {
                  onOpenAuth('login');
                }
              }}
              className="text-teal-700 font-semibold hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Appointments
            </button>
            <a
              href="#contact"
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>
        ) : (
          <div className="flex items-center gap-2.5 text-xs text-slate-500 whitespace-nowrap">
            {activeTab && activeTab !== 'dashboard' && setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Move Back to Dashboard"
              >
                <span>← Move Back</span>
              </button>
            )}
            <span className="hidden sm:inline-block capitalize font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              {role} Workspace
            </span>
            <span className="hidden sm:inline-block mx-1 text-slate-300">/</span>
            <span className="text-slate-700 capitalize font-medium">
              {activeTab ? activeTab.replace('-', ' ') : 'Dashboard'}
            </span>
          </div>
        )}

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Switch demo persona"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Persona</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Persona
                </div>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isActive = user?.email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      onClick={async () => {
                        setDemoMenuOpen(false);
                        await switchDemoUser(acc.email);
                        if (setActiveTab) setActiveTab('dashboard');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        isActive ? 'bg-teal-50/70 text-teal-900 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isActive ? (
                          <Check className="w-4 h-4 text-teal-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">{acc.name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {acc.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Notifications shortcut */}
              <button
                onClick={() => setActiveTab && setActiveTab('notifications')}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d9488&color=fff`}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setActiveTab && setActiveTab('profile');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
