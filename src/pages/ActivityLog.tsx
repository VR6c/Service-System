import React, { useState } from 'react';
import { History, Search, Filter, RefreshCw, X } from 'lucide-react';
import { Select } from '../components/common/Select';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/common/Pagination';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Info';
}

const INITIAL_LOGS: AuditLogItem[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-21 15:42:10',
    user: 'Huot Phanit',
    role: 'Service Advisor',
    action: 'Created Service Receipt #BYD-SR2608-001',
    module: 'Service Receipt',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 'log-102',
    timestamp: '2026-08-21 14:15:30',
    user: 'Dara Kim',
    role: 'QA Inspector',
    action: 'Approved Quality Inspection for Receipt #BYD-SR2608-001',
    module: 'Quality Assurance',
    ipAddress: '192.168.1.88',
    status: 'Success'
  },
  {
    id: 'log-103',
    timestamp: '2026-08-20 16:50:00',
    user: 'Huot Phanit',
    role: 'Service Advisor',
    action: 'Converted Quotation #BYD-QT2608-001 to Service Receipt',
    module: 'Quotation',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 'log-104',
    timestamp: '2026-08-20 11:30:15',
    user: 'Vannak Ouk',
    role: 'Branch Manager',
    action: 'Updated Branch Pricing Matrix & Tax Rules',
    module: 'Settings',
    ipAddress: '192.168.1.10',
    status: 'Info'
  },
  {
    id: 'log-105',
    timestamp: '2026-08-19 09:12:04',
    user: 'Admin System',
    role: 'Admin',
    action: 'User Account Created: "Vanna SO"',
    module: 'User Management',
    ipAddress: '192.168.1.1',
    status: 'Success'
  }
];

export const ActivityLog: React.FC = () => {
  const [logs] = useState<AuditLogItem[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.includes(searchTerm);

    const matchesModule = moduleFilter === 'All' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedLogs
  } = usePagination({
    data: filteredLogs,
    initialPageSize: 10,
    resetDeps: [searchTerm, moduleFilter]
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 flex items-center justify-center shadow-xs shrink-0">
            <History className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight truncate">
              System Activity Log
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-relaxed">
              Real-time audit trail and security compliance records for all user actions
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="btn-navy shrink-0 w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search activity log by user, action, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
          <span className="text-[11px] font-bold text-slate-400 px-1 truncate shrink-0">
            <AnimatedCounter value={filteredLogs.length} /> of <AnimatedCounter value={logs.length} /> entries
          </span>
          <div className="w-full sm:w-52 flex-1 sm:flex-none">
            <Select
              icon={<Filter className="w-3.5 h-3.5" />}
              value={moduleFilter}
              onChange={setModuleFilter}
              options={[
                { value: 'All', label: 'All Modules' },
                { value: 'Service Receipt', label: 'Service Receipt' },
                { value: 'Quotation', label: 'Quotation' },
                { value: 'User Management', label: 'User Management' },
                { value: 'Settings', label: 'Settings' },
                { value: 'Quality Assurance', label: 'Quality Assurance' }
              ]}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile Card View (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                <History className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-slate-800 font-heading">No activity logs found</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Try changing your search keywords or module filter.</p>
            </div>
          ) : (
            paginatedLogs.map((log, idx) => (
              <div
                key={log.id}
                className={`transaction-card p-4 sm:p-5 space-y-2.5 animate-slide-up stagger-${Math.min(idx + 1, 5)}`}
              >
                {/* Top: User, Role & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-heading font-extrabold text-sm text-slate-900 block">
                      {log.user}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {log.role}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    log.status === 'Success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.status === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></span>
                    {log.status}
                  </span>
                </div>

                {/* Action Details & Module Badge */}
                <div className="text-xs font-semibold text-slate-900">
                  {log.action}
                </div>

                {/* Footer: Module, IP & Timestamp */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-400 font-medium">
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px] border border-slate-200">
                    {log.module}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span>{log.ipAddress}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Module</th>
                <th className="py-3.5 px-5">Action Details</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                        <History className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 font-heading">No activity logs found</p>
                      <p className="text-xs text-slate-400 font-medium">Try changing your search keywords or module filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => (
                  <tr key={log.id} className={`transaction-row animate-slide-up stagger-${Math.min(idx + 1, 5)}`}>
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-500 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 font-heading text-sm">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {log.role}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-lg text-[10px] border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        log.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-smooth-pulse ${
                          log.status === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}></span>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredLogs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="logs"
        />
      </div>
    </div>
  );
};
