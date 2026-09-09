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
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false
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

  const renderNavContent = (collapsed: boolean = false) => (
    <div className={`flex flex-col h-full bg-[#070E1B] text-slate-200 justify-between select-none font-heading border-r border-slate-800/80 transition-all duration-300 ${collapsed ? 'p-2' : 'p-4'}`}>
      {/* Top Section */}
      <div className="space-y-4">
        {/* Header with 'SERVICE' text */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 pt-3 pb-3 border-b border-slate-800/70`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className={`font-black tracking-wider text-white uppercase font-heading ${collapsed ? 'text-sm' : 'text-xl'}`}>
              {collapsed ? 'S' : 'SERVICE'}
            </span>
          </div>
          {!collapsed && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {[
            { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: LayoutDashboard, mainKey: 'dashboard' },
            { id: 'receipt-all', label: 'Receipt', icon: FileCheck, mainKey: 'receipt' },
            { id: 'quotation-all', label: 'Quotation', icon: FileText, mainKey: 'quotation' },
            { id: 'customers', label: 'Customer', icon: Car, mainKey: 'customers' },
            ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: Users, mainKey: 'users' }] : []),
            { id: 'reports', label: 'Reports', icon: BarChart3, mainKey: 'reports' },
            ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings, mainKey: 'settings' }] : []),
            ...(isAdmin ? [{ id: 'activity-log', label: 'Activity Log', icon: History, mainKey: 'activity-log' }] : []),
          ].map(item => {
            const Icon = item.icon;
            const active = isMainTabActive(item.mainKey);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={item.label}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3.5 py-3'} rounded-2xl font-extrabold text-sm tracking-tight cursor-pointer active:scale-[0.97] transition-all duration-200 ease-out ${
                  active
                    ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-200 hover:text-white hover:bg-[#0F1A2D]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!collapsed && <span className="font-heading font-extrabold truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-auto">
        <div className={`flex items-center ${collapsed ? 'justify-center p-1.5' : 'justify-between p-2.5'} rounded-xl bg-[#0F1A2B] border border-slate-800`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/avatar.jpg"
              alt={currentUser?.name || 'Admin'}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 transition-transform duration-200 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Admin')}&background=E31B23&color=fff`;
              }}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-black text-white truncate leading-tight font-heading">
                  {currentUser?.name || 'Admin'}
                </span>
                <span className="text-xs text-slate-400 font-bold truncate mt-0.5 font-heading">
                  {currentUser?.role || 'Administrator'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0A121F] text-slate-100 flex-col shrink-0 min-h-screen border-r border-slate-800/60 no-print transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
        {renderNavContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-backdrop"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#0A121F] text-slate-100 flex flex-col h-full border-r border-slate-800 shadow-2xl z-50 animate-drawer">
            {renderNavContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};

