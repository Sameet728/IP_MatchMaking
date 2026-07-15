import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { FileText, DollarSign, Handshake, Brain, TrendingUp, Clock, CheckCircle, AlertTriangle, ArrowRight, Eye, Building2 } from 'lucide-react';
import { StatCard, ScoreRing, SectionHeader, ProgressBar, Badge } from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useApi';
import type { Patent, Deal } from '../../types';
import { cn, formatCurrency, formatDate, getStatusBadgeClass } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

const RADAR_DATA = [
  { subject: 'Novelty', A: 87 }, { subject: 'Commercial', A: 91 }, { subject: 'Market Fit', A: 88 },
  { subject: 'Strength', A: 84 }, { subject: 'Investment', A: 89 }, { subject: 'Licensing', A: 92 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export const InventorDashboard: React.FC = () => {
  const { data: fetchedPatents } = useFetch<Patent[]>('/patents');
  const patents = fetchedPatents || [];
  
  const { data: fetchedDeals } = useFetch<Deal[]>('/deals');
  const deals = fetchedDeals || [];

  const { user } = useAuthStore();
  const profile = user?.profile as { patents: number; licensedPatents: number; totalRoyalties: number } | undefined;
  const { data: fetchedRoyalties } = useFetch<any[]>('/royalties');
  const myRoyalties = fetchedRoyalties || [];

  // Generate basic revenue trend from royalties if any
  const REVENUE_TREND = [
    { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: 0 }, { month: 'Aug', revenue: 0 }, { month: 'Sep', revenue: 0 },
    { month: 'Oct', revenue: 0 }, { month: 'Nov', revenue: 0 }, { month: 'Dec', revenue: 0 }
  ];
  myRoyalties.forEach(r => {
    const d = new Date(r.dueDate);
    if (d.getFullYear() === new Date().getFullYear()) {
      REVENUE_TREND[d.getMonth()].revenue += r.amount;
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="page-title">Inventor Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back, {user?.name} · {user?.organization || 'Independent Researcher'}</p>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div variants={item}>
          <StatCard label="Total Patents" value={patents.length} icon={<FileText size={15} />} change={8} trend="up" changeLabel="vs last year" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Licensed Patents" value={profile?.licensedPatents ?? 4} icon={<Handshake size={15} />} change={33} trend="up" changeLabel="vs last year" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Total Royalties" value={profile?.totalRoyalties ?? 2800000} isCurrency icon={<DollarSign size={15} />} change={42} trend="up" changeLabel="YTD" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Active Deals" value={deals.length} icon={<Brain size={15} />} change={17} trend="up" changeLabel="this month" />
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* AI Score Overview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <SectionHeader title="AI Portfolio Score" subtitle="Based on top patent" />
          <div className="flex items-center gap-6 mb-4">
            <ScoreRing score={88} size={90} label="Overall" />
            <div className="flex-1 space-y-2.5">
              {[['Novelty', 87], ['Commercial', 91], ['Market Fit', 88], ['Strength', 84]].map(([lbl, val]) => (
                <div key={lbl as string}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-muted">{lbl}</span>
                    <span className="font-semibold text-text-primary">{val}</span>
                  </div>
                  <ProgressBar value={val as number} showLabel={false} />
                </div>
              ))}
            </div>
          </div>
          <RadarChart width={220} height={160} data={RADAR_DATA} className="mx-auto">
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#94A3B8' }} />
            <Radar name="Score" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={1.5} />
          </RadarChart>
        </motion.div>

        {/* Revenue trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card lg:col-span-2">
          <SectionHeader title="Royalty Revenue Trend" subtitle="2024 monthly breakdown" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [`$${(Number(v) / 1000).toFixed(0)}K`, 'Revenue']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Recent Patents */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <SectionHeader title="My Patents" action={<Link to="/patents" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>} />
          <div className="space-y-3">
            {patents.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{p.patentNumber} · {p.technologyDomain}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={getStatusBadgeClass(p.status)}>{p.status}</span>
                    <span className="text-[10px] text-text-muted">TRL {p.trl}</span>
                    <span className="text-[10px] text-text-muted ml-auto"><Eye size={10} className="inline mr-0.5" />{(p.views || 0).toLocaleString()}</span>
                  </div>
                </div>
                {p.aiReport && (
                  <div className={cn('text-lg font-bold shrink-0', p.aiReport.overallScore >= 80 ? 'text-success' : 'text-warning')}>
                    {p.aiReport.overallScore}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Deals */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <SectionHeader title="Active Deals" action={<Link to="/deals" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>} />
          <div className="space-y-3">
            {deals.slice(0, 4).map((d) => (
              <div key={d.id} className="p-3 rounded-lg border border-border hover:bg-navy-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs font-semibold text-text-primary line-clamp-1 flex-1">{d.patentTitle}</div>
                  <span className={getStatusBadgeClass(d.status)}>{d.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1"><Building2 size={10} />{d.licenseeName}</span>
                  <span>{d.licenseType}</span>
                  <span className="ml-auto font-semibold text-text-primary">{formatCurrency(d.upfrontFee)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Royalty table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <SectionHeader title="Recent Royalties" action={<Link to="/royalties" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patent</th><th>Licensee</th><th>Period</th><th>Amount</th><th>Due Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRoyalties.map((r) => (
                <tr key={r.id}>
                  <td className="max-w-[200px] truncate font-medium">{r.deal?.patentTitle || 'Patent License'}</td>
                  <td>{r.deal?.licenseeName || 'Licensee'}</td>
                  <td>{r.period}</td>
                  <td className="font-semibold">{formatCurrency(r.amount)}</td>
                  <td>{formatDate(r.dueDate)}</td>
                  <td>
                    <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
