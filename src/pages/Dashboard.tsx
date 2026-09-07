import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import type { Quotation, Receipt } from '../types';
import { ReceiptPreviewModal } from '../components/pdf/ReceiptPreviewModal';
import {
  FileText,
  FileCheck,
  DollarSign,
  Calendar,
  PlusCircle,
  Car,
  User,
  Users,
  ChevronDown,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  onViewQuotation?: (quotation?: Quotation) => void;
  onViewReceipt?: (receipt?: Receipt) => void;
  onSelectTab?: (tab: string) => void;
}

// Chart 1: Receipt Overview Monthly Trend Data
const receiptTrendData = [
  { month: 'Jan', receipts: 120, amount: 15000 },
  { month: 'Feb', receipts: 180, amount: 24000 },
  { month: 'Mar', receipts: 250, amount: 32000 },
  { month: 'Apr', receipts: 210, amount: 28000 },
  { month: 'May', receipts: 140, amount: 19000 },
  { month: 'Jun', receipts: 230, amount: 31000 },
  { month: 'Jul', receipts: 210, amount: 29000 },
  { month: 'Aug', receipts: 290, amount: 42000 },
  { month: 'Sep', receipts: 260, amount: 35000 },
  { month: 'Oct', receipts: 310, amount: 44000 },
  { month: 'Nov', receipts: 340, amount: 48000 },
  { month: 'Dec', receipts: 400, amount: 56000 }
];

// Chart 2: Receipt by Workshop Donut Data
const workshopPieData = [
  { name: 'BYD Phnom Penh', value: 563, percentage: 45, color: '#3B82F6' },
  { name: 'BYD Siem Reap', value: 313, percentage: 25, color: '#10B981' },
  { name: 'BYD Battambang', value: 188, percentage: 15, color: '#F59E0B' },
  { name: 'BYD Sihanoukville', value: 186, percentage: 15, color: '#8B5CF6' }
];

// Workshop Performance Table Data
const workshopPerformanceList = [
  { name: 'BYD Phnom Penh', receipts: 560, amount: 45250, performance: 80, color: 'bg-blue-600' },
  { name: 'BYD Siem Reap', receipts: 320, amount: 25600, performance: 60, color: 'bg-sky-500' },
  { name: 'BYD Battambang', receipts: 180, amount: 12400, performance: 40, color: 'bg-[#E31B23]' },
  { name: 'BYD Sihanoukville', receipts: 190, amount: 10800, performance: 50, color: 'bg-indigo-600' }
];

// Live Activities Timeline Data
const recentActivities = [
  { id: 1, title: 'New receipt #R-000125', user: 'Phanit', time: '5 mins ago', bg: 'bg-blue-50 text-blue-600' },
  { id: 2, title: 'New quotation #Q-00098', user: 'Dara', time: '15 mins ago', bg: 'bg-indigo-50 text-indigo-600' },
  { id: 3, title: 'Customer Sokha updated', user: 'Admin', time: '1 hour ago', bg: 'bg-emerald-50 text-emerald-600' },
  { id: 4, title: 'Workshop BYD SR updated', user: 'Admin', time: '2 hours ago', bg: 'bg-amber-50 text-amber-600' },
  { id: 5, title: 'New user Vanna added', user: 'Admin', time: '3 hours ago', bg: 'bg-purple-50 text-purple-600' }
];

export const Dashboard: React.FC<DashboardProps> = ({
  onViewQuotation,
  onViewReceipt,
  onSelectTab
}) => {
  const { currentUser, brands, branches } = useAuth();
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const fetched = await StorageService.fetchReceipts();
      setReceipts(fetched);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Welcome Banner & Date Range Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Service Advisor • {currentUser?.branch || 'BYD Siem Reap Branch'}
          </p>
        </div>

        {/* Date Selector Pill (Matching Image 2) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 px-4 shadow-2xs flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900 leading-tight">29 May 2024 - 29 May 2024</p>
            <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">Aug 21, 2026 • Thursday</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </div>
      </div>

      {/* Top 5 KPI Stat Cards Row (Matching Image 2 Mockup Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat 1: Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">25</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Active users</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ 12%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Stat 2: Total Customers */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">5,200</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Total customers</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ 8.5%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Stat 3: Total Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Receipts</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">1,250</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Total receipts</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ 15.3%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Stat 4: Total Quotations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Quotations</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">350</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Total quotations</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ 10.2%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Stat 5: Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">$120,500</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Total revenue</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ 18.7%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>
      </div>

      {/* Middle Row Analytics: Receipt Overview Chart + Receipt by Workshop Donut + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Receipt Overview Line/Area Chart (Col span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">Receipt Overview</h3>
              <p className="text-xs text-slate-400 font-medium">Monthly receipt count & revenue analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 cursor-pointer">
              <span>This Year</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Chart Legend Indicators */}
          <div className="flex items-center justify-center gap-6 mb-2 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>Receipt Count</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span>Amount (USD)</span>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={receiptTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="receiptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#081525', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="receipts" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#receiptGradient)" />
                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#amountGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receipt by Workshop Donut Chart (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Receipt by Workshop</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 cursor-pointer">
              <span>This Year</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Donut Chart with Center Total Label */}
          <div className="relative w-full h-44 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workshopPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {workshopPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 font-heading leading-none">1,250</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">Total</span>
            </div>
          </div>

          {/* Legend Items Stack */}
          <div className="space-y-2 text-xs font-medium border-t border-slate-100 pt-3">
            {workshopPieData.map((w, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }}></span>
                  <span className="text-slate-800 font-semibold truncate max-w-[130px]">{w.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold text-[11px]">{w.percentage}%</span>
                  <span className="text-slate-400 text-[10px] block leading-none">({w.value} receipts)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Timeline Feed (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading mb-4">Recent Activities</h3>
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${act.bg}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium">by <span className="font-semibold text-slate-700">{act.user}</span> • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('activity-log')}
            className="w-full mt-4 py-2 text-xs font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>View all activities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Top Workshop Performance & Recent Service Receipts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Workshop Performance Card (Col span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Top Workshop Performance</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 cursor-pointer">
              <span>This Year</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 text-[10px]">
                  <th className="py-2.5 px-3">Workshop</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                  <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-3">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {workshopPerformanceList.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{w.name}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{w.receipts}</td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">${w.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-3 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.performance}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{w.performance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Service Receipts Table (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">Recent Service Receipts</h3>
              <button
                onClick={() => onViewReceipt && onViewReceipt()}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer shadow-2xs"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 text-[10px]">
                    <th className="py-2.5 px-3">Receipt No.</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Vehicle / Plate No.</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {receipts.slice(0, 5).map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setPreviewReceipt(r)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono text-[11px]">{r.receipt_no}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{r.customer_name}</td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">{r.vehicle_model} / <span className="font-semibold">{r.plate_no}</span></td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">${r.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          r.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Cards Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <h3 className="text-base font-extrabold text-slate-900 font-heading mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onSelectTab ? onSelectTab('receipt-create') : (onViewReceipt && onViewReceipt())}
            className="bg-[#FFF0F2] hover:bg-[#FFE0E6] border border-rose-200/60 rounded-2xl p-4 flex items-center gap-3.5 transition cursor-pointer group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-[#E31B23] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 font-heading">New Service Receipt</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Create official customer service receipt</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab ? onSelectTab('quotation-create') : (onViewQuotation && onViewQuotation())}
            className="bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-blue-200/60 rounded-2xl p-4 flex items-center gap-3.5 transition cursor-pointer group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 font-heading">New Quotation</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Prepare repair fee estimate</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab && onSelectTab('customers')}
            className="bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-emerald-200/60 rounded-2xl p-4 flex items-center gap-3.5 transition cursor-pointer group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 font-heading">View Customers</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">View and search customer profiles</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab && onSelectTab('users')}
            className="bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-purple-200/60 rounded-2xl p-4 flex items-center gap-3.5 transition cursor-pointer group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-purple-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 font-heading">Manage Users</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Configure system staff accounts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <ReceiptPreviewModal
          receipt={previewReceipt}
          brand={brands.find(b => b.id === previewReceipt.brand_id)}
          branch={branches.find(br => br.id === previewReceipt.branch_id)}
          isOpen={!!previewReceipt}
          onClose={() => setPreviewReceipt(null)}
        />
      )}
    </div>
  );
};
