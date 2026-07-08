import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle,
  Download, Filter, Search, Calendar, Building2, ArrowRight,
  BarChart3, TrendingDown, RefreshCw
} from 'lucide-react';
import { MOCK_ROYALTIES, REVENUE_TREND } from '../../data/mockData';
import { cn, formatCurrency, formatDate, getStatusBadgeClass } from '../../lib/utils';
import { StatCard, SectionHeader, ProgressBar } from '../../components/ui/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const STATUS_COLOR: Record<string, string> = {
  Received: 'badge-success',
  Pending: 'badge-warning',
  Overdue: 'badge-danger',
  Disputed: 'badge-danger',
};

const QUARTERLY_DATA = [
  { q: 'Q1 2023', received: 420000, pending: 80000, overdue: 0 },
  { q: 'Q2 2023', received: 580000, pending: 60000, overdue: 30000 },
  { q: 'Q3 2023', received: 490000, pending: 90000, overdue: 0 },
  { q: 'Q4 2023', received: 710000, pending: 40000, overdue: 0 },
  { q: 'Q1 2024', received: 650000, pending: 120000, overdue: 0 },
  { q: 'Q2 2024', received: 880000, pending: 95000, overdue: 25000 },
];

export const RoyaltiesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');

  const filtered = MOCK_ROYALTIES.filter(r => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || r.status === statusFilter) &&
      (periodFilter === 'All' || r.period.includes(periodFilter)) &&
      (!q || r.patentTitle.toLowerCase().includes(q) || r.licenseeName.toLowerCase().includes(q));
  });

  const totalReceived = MOCK_ROYALTIES.filter(r => r.status === 'Received').reduce((s, r) => s + r.amount, 0);
  const totalPending = MOCK_ROYALTIES.filter(r => r.status === 'Pending').reduce((s, r) => s + r.amount, 0);
  const totalOverdue = MOCK_ROYALTIES.filter(r => r.status === 'Overdue').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Royalty Management</h1>
          <p className="text-text-muted text-sm mt-1">Track incoming royalty payments, schedules, and disputes</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs gap-1"><RefreshCw size={13} /> Sync Payments</button>
          <button className="btn-secondary text-xs gap-1"><Download size={13} /> Export</button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Received (YTD)', value: totalReceived, isCurrency: true, icon: <CheckCircle size={14} />, change: 38, trend: 'up' as const },
          { label: 'Pending Payments', value: totalPending, isCurrency: true, icon: <Clock size={14} /> },
          { label: 'Overdue', value: totalOverdue, isCurrency: true, icon: <AlertTriangle size={14} /> },
          { label: 'Active Agreements', value: 7, icon: <TrendingUp size={14} />, change: 2, trend: 'up' as const },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="vs last year" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Quarterly chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card lg:col-span-2">
          <SectionHeader title="Quarterly Royalty Collections" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={QUARTERLY_DATA} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="q" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v: any, name) => [`$${(Number(v) / 1000).toFixed(0)}K`, name]} />
              <Bar dataKey="received" name="Received" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly revenue trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <SectionHeader title="Revenue Trend 2024" />
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="ry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#ry)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {[
              { label: 'This Month', value: totalReceived / 12, trend: 'up' },
              { label: 'Last Month', value: totalReceived / 12 * 0.87, trend: 'up' },
              { label: 'Avg Monthly', value: totalReceived / 12 * 0.94, trend: 'neutral' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-text-muted">{r.label}</span>
                <span className="font-semibold text-text-primary">{formatCurrency(r.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Royalty table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionHeader title="Royalty Schedule" subtitle={`${filtered.length} payments`} />
          <div className="flex gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-8 text-sm w-40" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-32">
              {['All', 'Received', 'Pending', 'Overdue', 'Disputed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patent</th>
                <th>Licensee</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Received Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="max-w-[200px]">
                    <div className="font-semibold text-xs line-clamp-1">{r.patentTitle}</div>
                  </td>
                  <td className="text-xs text-text-muted">{r.licenseeName}</td>
                  <td className="text-xs">{r.period}</td>
                  <td className="font-bold text-sm">{formatCurrency(r.amount)}</td>
                  <td className="text-xs">{formatDate(r.dueDate)}</td>
                  <td className="text-xs text-text-muted">{r.receivedDate ? formatDate(r.receivedDate) : '—'}</td>
                  <td>
                    <span className={cn('badge', STATUS_COLOR[r.status] || 'badge-neutral')}>{r.status}</span>
                  </td>
                  <td>
                    {r.status === 'Overdue' && (
                      <button className="btn-ghost text-xs text-danger gap-1"><AlertTriangle size={11} /> Chase</button>
                    )}
                    {r.status === 'Disputed' && (
                      <button className="btn-ghost text-xs text-warning gap-1"><AlertTriangle size={11} /> Resolve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border flex-wrap gap-3">
          <div className="flex gap-6">
            <div className="text-xs">
              <span className="text-text-muted">Total shown: </span>
              <span className="font-bold text-text-primary">{formatCurrency(filtered.reduce((s, r) => s + r.amount, 0))}</span>
            </div>
            <div className="text-xs">
              <span className="text-text-muted">Overdue: </span>
              <span className="font-bold text-danger">{formatCurrency(filtered.filter(r => r.status === 'Overdue').reduce((s, r) => s + r.amount, 0))}</span>
            </div>
          </div>
          <button className="btn-secondary text-xs gap-1"><Download size={13} /> Export to Excel</button>
        </div>
      </motion.div>
    </div>
  );
};
