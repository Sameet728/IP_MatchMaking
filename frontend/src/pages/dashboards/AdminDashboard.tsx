import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, FileText, DollarSign, Shield, Activity, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Settings, Eye } from 'lucide-react';
import { StatCard, SectionHeader, ProgressBar } from '../../components/ui/StatCard';
import { PLATFORM_STATS, MOCK_USERS, MOCK_PATENTS, UNIVERSITY_DEPARTMENTS, REVENUE_TREND } from '../../data/mockData';
import { formatCurrency, getStatusBadgeClass, formatRelativeTime } from '../../lib/utils';
import { Link } from 'react-router-dom';

const GROWTH_DATA = [
  { month: 'Jan', users: 820, patents: 310, deals: 38 },
  { month: 'Feb', users: 890, patents: 325, deals: 41 },
  { month: 'Mar', users: 950, patents: 341, deals: 43 },
  { month: 'Apr', users: 1020, patents: 355, deals: 44 },
  { month: 'May', users: 1120, patents: 368, deals: 46 },
  { month: 'Jun', users: 1190, patents: 378, deals: 47 },
  { month: 'Jul', users: 1247, patents: 387, deals: 47 },
];

const ROLE_DIST = [
  { role: 'Inventors', count: 423, color: '#2563EB' },
  { role: 'Universities', count: 89, color: '#10B981' },
  { role: 'Startups', count: 312, color: '#F59E0B' },
  { role: 'Enterprise', count: 198, color: '#0F172A' },
  { role: 'Brokers', count: 225, color: '#8B5CF6' },
];

const AUDIT_LOGS = [
  { action: 'Patent IN202341012345 licensed to Ola Electric', user: 'System', time: new Date(Date.now() - 1800000).toISOString(), type: 'success' },
  { action: 'New university registered: IIT Roorkee', user: 'Admin', time: new Date(Date.now() - 7200000).toISOString(), type: 'info' },
  { action: 'AI Report flagged for low confidence: p47', user: 'AI System', time: new Date(Date.now() - 14400000).toISOString(), type: 'warning' },
  { action: 'Subscription upgraded: Tata Innovations → Enterprise', user: 'Billing', time: new Date(Date.now() - 86400000).toISOString(), type: 'success' },
  { action: 'User account suspended: suspicious activity', user: 'Auto-Moderation', time: new Date(Date.now() - 172800000).toISOString(), type: 'danger' },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Platform Administration</h1>
            <p className="text-text-muted text-sm mt-1">IP COS Platform · All Systems Operational · Last sync: Just now</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-success font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live
            </span>
            <Link to="/admin/settings" className="btn-secondary text-xs"><Settings size={13} /> Settings</Link>
          </div>
        </div>
      </motion.div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: PLATFORM_STATS.totalUsers, icon: <Users size={15} />, change: 14, trend: 'up' as const },
          { label: 'Total Patents', value: PLATFORM_STATS.totalPatents, icon: <FileText size={15} />, change: 12, trend: 'up' as const },
          { label: 'Platform Revenue', value: PLATFORM_STATS.totalRevenue, isCurrency: true, icon: <DollarSign size={15} />, change: 38, trend: 'up' as const },
          { label: 'Active Deals', value: PLATFORM_STATS.activeDeals, icon: <Activity size={15} />, change: 7, trend: 'up' as const },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="MoM" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Growth chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2">
          <SectionHeader title="Platform Growth" subtitle="Users, patents, and deals over time" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={GROWTH_DATA}>
              <defs>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} fill="url(#gu)" name="Users" />
              <Area type="monotone" dataKey="patents" stroke="#10B981" strokeWidth={2} fill="url(#gp)" name="Patents" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <SectionHeader title="User Distribution" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ROLE_DIST} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {ROLE_DIST.map((r, i) => <Cell key={i} fill={r.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ROLE_DIST.map((r) => (
              <div key={r.role} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-xs text-text-muted flex-1">{r.role}</span>
                <span className="text-xs font-semibold">{r.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* System health */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <SectionHeader title="System Health" />
          <div className="space-y-3">
            {[
              { name: 'API Response Time', value: 98, unit: '142ms avg', color: '#10B981' },
              { name: 'AI Engine Uptime', value: 99.7, unit: '99.7% uptime', color: '#10B981' },
              { name: 'Database Performance', value: 94, unit: '94% optimal', color: '#10B981' },
              { name: 'Storage Utilization', value: 67, unit: '670GB / 1TB', color: '#F59E0B' },
              { name: 'Queue Processing', value: 89, unit: '89% throughput', color: '#10B981' },
            ].map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">{s.name}</span>
                  <span className="font-semibold text-text-primary">{s.unit}</span>
                </div>
                <ProgressBar value={s.value} color={s.color} size="md" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Audit log */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <SectionHeader title="Audit Log" subtitle="Recent platform events" action={<Link to="/admin/logs" className="btn-ghost text-xs">View all</Link>} />
          <div className="space-y-2">
            {AUDIT_LOGS.map((log, i) => {
              const icons = { success: <CheckCircle size={13} className="text-success" />, info: <Activity size={13} className="text-accent" />, warning: <AlertTriangle size={13} className="text-warning" />, danger: <AlertTriangle size={13} className="text-danger" /> };
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-navy-50 transition-colors">
                  <div className="mt-0.5 shrink-0">{icons[log.type as keyof typeof icons]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary line-clamp-2">{log.action}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{log.user} · {formatRelativeTime(log.time)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick admin actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Pending Approvals', value: 12, href: '/admin/moderation', color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Support Tickets', value: 8, href: '/admin/support', color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'AI Queue', value: 34, href: '/admin/ai', color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'New Users (7d)', value: 47, href: '/admin/users', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Revenue (MTD)', value: '$2.35M', href: '/admin/analytics', color: 'text-text-primary', bg: 'bg-navy-100' },
            { label: 'Subscriptions', value: 234, href: '/admin/subscriptions', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((a) => (
            <Link key={a.label} to={a.href}
              className={`p-3 rounded-lg ${a.bg} hover:shadow-sm transition-all text-center cursor-pointer`}>
              <div className={`text-xl font-bold ${a.color}`}>{a.value}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{a.label}</div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
