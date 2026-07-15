import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Handshake, DollarSign, TrendingUp, Clock, ArrowRight, Building2, CheckCircle, AlertTriangle } from 'lucide-react';
import { StatCard, SectionHeader, ProgressBar, Badge } from '../../components/ui/StatCard';
import { formatCurrency, formatDate, getStatusBadgeClass, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFetch } from '../../hooks/useApi';

const COMMISSION_DATA = [
  { month: 'Jan', commission: 120000 }, { month: 'Feb', commission: 180000 },
  { month: 'Mar', commission: 95000 }, { month: 'Apr', commission: 240000 },
  { month: 'May', commission: 310000 }, { month: 'Jun', commission: 285000 },
  { month: 'Jul', commission: 420000 },
];

const NEGOTIATION_STAGES = [
  { deal: 'Li-S Battery → Ola Electric', stage: 'Active License', health: 95, value: 5000000 },
  { deal: 'CRISPR Diagnostics → BioSynth', stage: 'Term Sheet', health: 78, value: 1500000 },
  { deal: 'Nano Packaging → GreenPack', stage: 'NDA Signed', health: 65, value: 1200000 },
  { deal: 'Atm. Water → Adani', stage: 'Signed', health: 100, value: 3000000 },
  { deal: 'AI Maintenance → Tata', stage: 'Negotiating', health: 52, value: 750000 },
];

export const BrokerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const profile = user?.profile as { dealsCompleted: number; totalCommissions: number; activeDeals: number; specializations: string[] } | undefined;
  const { data: fetchedDeals } = useFetch<any[]>('/deals');
  const deals = fetchedDeals || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Broker Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">{user?.name} · {user?.organization?.name || 'Independent'} · {profile?.specializations?.join(', ')}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/deals" className="btn-primary text-xs">View Active Deals</Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Deals Completed', value: profile?.dealsCompleted ?? 47, icon: <CheckCircle size={15} />, change: 24, trend: 'up' as const },
          { label: 'Active Deals', value: profile?.activeDeals ?? 9, icon: <Clock size={15} />, change: 12, trend: 'up' as const },
          { label: 'Total Commissions', value: profile?.totalCommissions ?? 8700000, isCurrency: true, icon: <DollarSign size={15} />, change: 31, trend: 'up' as const },
          { label: 'Avg Deal Value', value: formatCurrency(3200000) as unknown as number, icon: <TrendingUp size={15} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="vs last year" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Deal health tracker */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2">
          <SectionHeader title="Active Deal Health Monitor" subtitle="Real-time deal status and health scores" action={<Link to="/deals" className="btn-ghost text-xs gap-1">All Deals <ArrowRight size={12} /></Link>} />
          <div className="space-y-3">
            {NEGOTIATION_STAGES.map((d, i) => (
              <div key={i} className="p-3 rounded-lg border border-border hover:bg-navy-50 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-text-primary truncate flex-1">{d.deal}</span>
                  <span className={getStatusBadgeClass(d.stage)}>{d.stage}</span>
                  <span className="text-xs font-bold text-text-primary shrink-0">{formatCurrency(d.value)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-text-muted">Deal Health</span>
                  <ProgressBar value={d.health} className="flex-1" color={d.health >= 80 ? '#10B981' : d.health >= 60 ? '#F59E0B' : '#EF4444'} showLabel />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Commission summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <SectionHeader title="Commission Summary" />
          <div className="space-y-3 mb-4">
            {[
              { label: 'Q3 2024 (Projected)', value: 1050000, trend: '+12%', color: 'text-success' },
              { label: 'Q2 2024 (Actual)', value: 875000, trend: '+31%', color: 'text-success' },
              { label: 'Q1 2024 (Actual)', value: 668000, trend: '+18%', color: 'text-success' },
              { label: 'Pending Deals', value: 4200000, trend: 'Est. Q4', color: 'text-warning' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                <div>
                  <div className="text-xs font-medium text-text-primary">{item.label}</div>
                  <div className={`text-[11px] font-medium ${item.color}`}>{item.trend}</div>
                </div>
                <span className="text-sm font-bold text-text-primary">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={COMMISSION_DATA} barSize={14}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: any) => [`$${(Number(v) / 1000).toFixed(0)}K`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="commission" fill="#2563EB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent deals table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <SectionHeader title="Deal History" action={<button className="btn-secondary text-xs">Export Commissions</button>} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Patent</th><th>Licensee</th><th>Type</th><th>Value</th><th>My Commission (5%)</th><th>Status</th></tr></thead>
            <tbody>
              {deals.map((d: any) => (
                <tr key={d.id}>
                  <td className="max-w-[200px] truncate font-medium">{d.patents?.[0]?.title || d.title || '—'}</td>
                  <td>{d.buyer?.name || '—'}</td>
                  <td><span className="badge-neutral badge">{d.type || d.licenseType || '—'}</span></td>
                  <td className="font-semibold">{formatCurrency(d.dealValue || 0)}</td>
                  <td className="font-semibold text-success">{formatCurrency((d.dealValue || 0) * 0.05)}</td>
                  <td><span className={getStatusBadgeClass(d.status)}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
