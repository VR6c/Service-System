import React, { useState } from 'react';
import { History, Search, Filter, RefreshCw, X } from 'lucide-react';
import { Select } from '../components/common/Select';

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

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shadow-2xs shrink-0 font-bold">
            <History className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-heading">System Activity Log</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time audit trail and security compliance records for all user actions</p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="btn-navy shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search activity log by user, action, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-48">
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action Details</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className={`hover:bg-slate-50/80 transaction-row-hover animate-slide-up stagger-${Math.min(idx + 1, 5)}`}>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-500 text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {log.user}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {log.role}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-lg text-[10px] border border-slate-200">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      log.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
