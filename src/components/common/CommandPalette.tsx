import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Plus,
  BarChart3,
  Users,
  Building2,
  GitBranch,
  Settings,
  Search,
  X,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allCommands = [
    { id: 'dashboard', label: t.dashboard, category: 'Navigation', icon: LayoutDashboard, tab: 'dashboard', adminOnly: false },
    { id: 'create-receipt', label: t.createReceipt, category: 'Actions', icon: Plus, tab: 'receipt-create', adminOnly: false },
    { id: 'create-quotation', label: t.createQuotation, category: 'Actions', icon: Plus, tab: 'quotation-create', adminOnly: false },
    { id: 'receipt-my', label: `My ${t.receipts}`, category: 'Receipts', icon: FileCheck, tab: 'receipt-my', adminOnly: false },
    { id: 'receipt-all', label: `All ${t.receipts}`, category: 'Receipts', icon: FileCheck, tab: 'receipt-all', adminOnly: false },
    { id: 'quotation-my', label: `My ${t.quotations}`, category: 'Quotations', icon: FileText, tab: 'quotation-my', adminOnly: false },
    { id: 'quotation-all', label: `All ${t.quotations}`, category: 'Quotations', icon: FileText, tab: 'quotation-all', adminOnly: false },
    { id: 'reports', label: t.reports, category: 'Analytics', icon: BarChart3, tab: 'reports', adminOnly: false },
    { id: 'users', label: t.users, category: 'Management', icon: Users, tab: 'users', adminOnly: true },
    { id: 'brands', label: t.brands, category: 'Management', icon: Building2, tab: 'brands', adminOnly: true },
    { id: 'branches', label: t.branches, category: 'Management', icon: GitBranch, tab: 'branches', adminOnly: true },
    { id: 'settings', label: t.settings, category: 'System', icon: Settings, tab: 'settings', adminOnly: true }
  ];

  const commands = allCommands.filter(cmd => !cmd.adminOnly || isAdmin);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 no-print animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-backdrop"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-pop-scale">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search section (e.g., Receipt, User, Reports)..."
            className="w-full py-4 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.tab)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-red-50/80 hover:text-red-700 text-slate-700 font-medium text-xs transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-red-100 text-slate-500 group-hover:text-red-600 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900 group-hover:text-red-700">
                      {cmd.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-500 uppercase tracking-wider bg-slate-100 group-hover:bg-red-100/50 px-2 py-0.5 rounded-md">
                      {cmd.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs font-mono">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs font-mono">Ctrl + K</kbd> toggle</span>
          </div>
          <span className="text-red-600 font-bold">BYD & DENZA System</span>
        </div>
      </div>
    </div>
  );
};
