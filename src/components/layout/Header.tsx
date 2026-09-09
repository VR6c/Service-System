import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell } from 'lucide-react';
import { Select } from '../common/Select';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenCommandPalette
}) => {
  const { currentUser, users, switchUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const userName = currentUser?.name || 'Admin';
  const userRole = currentUser?.role || 'Administrator';

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xs sticky top-0 z-30 no-print select-none">
      {/* Left Menu Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="font-bold text-slate-900 mr-2">BYD Official Service System</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 ml-2">{currentUser?.branch || 'Siem Reap Branch'}</span>
        </div>

        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            title="Search or commands (Ctrl+K)"
          >
            <span>Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white rounded border border-slate-300 shadow-2xs text-slate-600">
              Ctrl K
            </kbd>
          </button>
        )}
      </div>

      {/* Right Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200 active:scale-95 border border-transparent hover:border-slate-200"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-smooth-pulse">
              3
            </span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-dropdown text-xs origin-top-right">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 font-heading">Notifications</span>
                <span className="text-[10px] font-bold text-[#E31B23] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">3 New</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 transition-all duration-150 hover:translate-x-0.5 cursor-pointer">
                  <p className="font-bold text-slate-900">New Receipt #BYD-SR2608-001</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sokunthy CHENG • $350.00 • 5 mins ago</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 transition-all duration-150 hover:translate-x-0.5 cursor-pointer">
                  <p className="font-bold text-slate-900">Quotation Pending Approval</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">BYD-QT2608-002 • Lonh Sreymom • 15 mins ago</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 transition-all duration-150 hover:translate-x-0.5 cursor-pointer">
                  <p className="font-bold text-slate-900">Branch Inventory Updated</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">BYD Siem Reap Center • 1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src="/avatar.jpg"
            alt={userName}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E31B23&color=fff`;
            }}
          />
          <div className="hidden sm:flex flex-col text-left min-w-[140px]">
            <Select
              value={currentUser?.id || ''}
              onChange={switchUser}
              options={users.map(u => ({ value: u.id, label: u.name }))}
              size="sm"
            />
            <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


