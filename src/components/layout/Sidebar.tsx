import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Car,
  Users,
  BarChart3,
  Settings,
  History,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isMainTabActive = (tabKey: string) => {
    if (tabKey === 'dashboard' && activeTab === 'dashboard') return true;
    if (tabKey === 'receipt' && activeTab.startsWith('receipt')) return true;
    if (tabKey === 'quotation' && activeTab.startsWith('quotation')) return true;
    if (tabKey === 'customers' && (activeTab === 'customers' || activeTab === 'vehicles')) return true;
    if (tabKey === 'users' && activeTab === 'users') return true;
    if (tabKey === 'brands' && (activeTab === 'brands' || activeTab === 'branches')) return true;
    if (tabKey === 'reports' && activeTab.startsWith('reports')) return true;
    if (tabKey === 'settings' && activeTab === 'settings') return true;
    if (tabKey === 'activity-log' && activeTab === 'activity-log') return true;
    return false;
  };

  const isAdmin = currentUser?.role === 'Admin';

  const navContent = (
    <div className="flex flex-col h-full bg-[#070E1B] text-slate-200 p-4 justify-between select-none font-heading border-r border-slate-800/80">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Header with ONLY 'SERVICE' text (No logo) */}
        <div className="flex items-center justify-between px-3 pt-3 pb-3 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider text-white uppercase font-heading">
              SERVICE
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
              isMainTabActive('dashboard')
                ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="font-heading font-extrabold">{t.dashboard || 'Dashboard'}</span>
          </button>

          <button
            onClick={() => handleSelectTab('receipt-all')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
              isMainTabActive('receipt')
                ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span className="font-heading font-extrabold">Receipt</span>
          </button>

          <button
            onClick={() => handleSelectTab('quotation-all')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
              isMainTabActive('quotation')
                ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="font-heading font-extrabold">Quotation</span>
          </button>

          <button
            onClick={() => handleSelectTab('customers')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
              isMainTabActive('customers')
                ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
            }`}
          >
            <Car className="w-4 h-4 shrink-0" />
            <span className="font-heading font-extrabold">Customer</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleSelectTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
                isMainTabActive('users')
                  ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="font-heading font-extrabold">User Management</span>
            </button>
          )}

          <button
            onClick={() => handleSelectTab('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
              isMainTabActive('reports')
                ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="font-heading font-extrabold">Reports</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleSelectTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
                isMainTabActive('settings')
                  ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="font-heading font-extrabold">Settings</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleSelectTab('activity-log')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-extrabold text-sm tracking-tight transition-all cursor-pointer ${
                isMainTabActive('activity-log')
                  ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span className="font-heading font-extrabold">Activity Log</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom User Profile Section (Matching Image 2) */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-auto">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1A2B] border border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/avatar.jpg"
              alt={currentUser?.name || 'Admin'}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Admin')}&background=E31B23&color=fff`;
              }}
            />
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-black text-white truncate leading-tight font-heading">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="text-xs text-slate-400 font-bold truncate mt-0.5 font-heading">
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition cursor-pointer shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0A121F] text-slate-100 flex-col shrink-0 min-h-screen border-r border-slate-800/60 no-print">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#0A121F] text-slate-100 flex flex-col h-full border-r border-slate-800 shadow-2xl z-50">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

