import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { Archive, TrendingUp, Users, DollarSign, Building2, ArrowRight, FileText, Handshake } from 'lucide-react';
import { StatCard, SectionHeader, ProgressBar } from '../../components/ui/StatCard';
import { formatCurrency, getStatusBadgeClass } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFetch } from '../../hooks/useApi';

const DEPT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

export const UniversityDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: fetchedPatents } = useFetch<any[]>('/patents');
  const { data: fetchedDeals } = useFetch<any[]>('/deals');
  const patents = fetchedPatents || [];
  const deals = fetchedDeals || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">University Technology Transfer Office</h1>
            <p className="text-text-muted text-sm mt-1">IIT Delhi · 24 Departments · Fiscal Year 2024</p>
          </div>
          <div className="flex gap-2">
            <Link to="/patents" className="btn-secondary text-xs">Upload Patents</Link>
            <Link to="/reports" className="btn-primary text-xs">Generate Report</Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Patents', value: patents.length || 0, icon: <Archive size={15} />, change: 12, trend: 'up' as const },
          { label: 'Licensed Patents', value: patents.filter((p: any) => p.status === 'LICENSED').length, icon: <Handshake size={15} />, change: 23, trend: 'up' as const },
          { label: 'Revenue Generated', value: deals.reduce((s: number, d: any) => s + (d.dealValue || 0), 0), isCurrency: true, icon: <DollarSign size={15} />, change: 38, trend: 'up' as const },
          { label: 'Active Deals', value: deals.filter((d: any) => d.status === 'ACTIVE').length, icon: <Users size={15} />, change: 9, trend: 'up' as const },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="vs last year" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Department breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2">
          <SectionHeader title="Department Performance" subtitle="Patents filed and licensed by department" action={<Link to="/departments" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={UNIVERSITY_DEPARTMENTS} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="patents" fill="#2563EB" name="Total Patents" radius={[2, 2, 0, 0]} />
              <Bar dataKey="licensed" fill="#10B981" name="Licensed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Domain pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <SectionHeader title="By Technology Domain" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DOMAIN_BREAKDOWN} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {DOMAIN_BREAKDOWN.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ fontSize: 10, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {DOMAIN_BREAKDOWN.slice(0, 5).map((d, i) => (
              <div key={d.domain} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: DEPT_COLORS[i] }} />
                <span className="text-xs text-text-muted flex-1 truncate">{d.domain}</span>
                <span className="text-xs font-semibold text-text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <SectionHeader title="Revenue Trend 2024" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Licensing funnel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <SectionHeader title="Licensing Funnel" subtitle="Current portfolio pipeline" />
          <div className="space-y-3 mt-2">
            {LICENSING_FUNNEL.map((f, i) => {
              const pct = (f.count / LICENSING_FUNNEL[0].count) * 100;
              const colors = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
              return (
                <div key={f.stage}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted font-medium">{f.stage}</span>
                    <span className="font-bold text-text-primary">{f.count}</span>
                  </div>
                  <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: colors[i] }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Department table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <SectionHeader title="Department Rankings" action={<button className="btn-secondary text-xs">Export Report</button>} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Department</th><th>Total Patents</th><th>Licensed</th><th>License Rate</th><th>Revenue Generated</th></tr></thead>
            <tbody>
              {UNIVERSITY_DEPARTMENTS.map((d, i) => (
                <tr key={d.dept}>
                  <td className="font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-navy-100 text-text-muted text-xs flex items-center justify-center font-bold">#{i + 1}</span>
                    {d.dept}
                  </td>
                  <td>{d.patents}</td>
                  <td>{d.licensed}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={d.licensed} max={d.patents} className="w-16" />
                      <span className="text-xs font-medium">{Math.round((d.licensed / d.patents) * 100)}%</span>
                    </div>
                  </td>
                  <td className="font-semibold text-success">{formatCurrency(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
