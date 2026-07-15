import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { Briefcase, Search, Brain, DollarSign, TrendingUp, Globe, ArrowRight, Building2, Target, Shield } from 'lucide-react';
import { StatCard, SectionHeader, ScoreRing, ProgressBar, Badge } from '../../components/ui/StatCard';
import { formatCurrency, getStatusBadgeClass, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFetch } from '../../hooks/useApi';

const ACQUISITION_PIPELINE = [
  { stage: 'Scouted', count: 47, value: 120000000 },
  { stage: 'Shortlisted', count: 23, value: 58000000 },
  { stage: 'Due Diligence', count: 11, value: 28000000 },
  { stage: 'Negotiating', count: 6, value: 16000000 },
  { stage: 'Closed', count: 3, value: 8500000 },
];

const ROI_DATA = [
  { year: '2020', roi: 142 }, { year: '2021', roi: 198 }, { year: '2022', roi: 267 },
  { year: '2023', roi: 312 }, { year: '2024', roi: 389 },
];

export const EnterpriseDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const profile = user?.profile as { company: string; industry: string; ipBudget: number; acquisitions: number } | undefined;
  const { data: fetchedPatents } = useFetch<any[]>('/patents?isListed=true&limit=3');
  const featuredPatents = fetchedPatents || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Enterprise IP Intelligence</h1>
            <p className="text-text-muted text-sm mt-1">{profile?.company || 'Tata Innovations'} · IP Budget: {formatCurrency(profile?.ipBudget || 50000000)} · {profile?.acquisitions || 23} Acquisitions</p>
          </div>
          <div className="flex gap-2">
            <Link to="/marketplace" className="btn-secondary text-xs">Launch AI Scout</Link>
            <Link to="/portfolio" className="btn-primary text-xs">View Portfolio</Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'IP Portfolio Value', value: 285000000, isCurrency: true, icon: <Briefcase size={15} />, change: 34, trend: 'up' as const },
          { label: 'Acquisitions (YTD)', value: profile?.acquisitions ?? 23, icon: <Target size={15} />, change: 15, trend: 'up' as const },
          { label: 'Active Licenses', value: 67, icon: <Shield size={15} />, change: 8, trend: 'up' as const },
          { label: 'Avg Patent ROI', value: '389%', icon: <TrendingUp size={15} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="vs last year" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Acquisition pipeline */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <SectionHeader title="Acquisition Pipeline" />
          <div className="space-y-4">
            {ACQUISITION_PIPELINE.map((s, i) => (
              <div key={s.stage}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-muted font-medium">{s.stage}</span>
                  <div className="text-right">
                    <span className="font-bold text-text-primary">{s.count}</span>
                    <span className="text-text-muted ml-2">{formatCurrency(s.value)}</span>
                  </div>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-accent" style={{ opacity: 1 - i * 0.15 }}
                    initial={{ width: 0 }} animate={{ width: `${(s.count / 47) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ROI trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card lg:col-span-2">
          <SectionHeader title="IP Portfolio ROI" subtitle="Return on IP investment over 5 years" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ROI_DATA}>
              <defs>
                <linearGradient id="roi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'ROI']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="roi" stroke="#2563EB" strokeWidth={2} fill="url(#roi)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Featured patents for scouting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <SectionHeader title="AI Scout Recommendations" subtitle="High-value patents matching your strategy" action={<Link to="/marketplace" className="btn-ghost text-xs gap-1">Browse <ArrowRight size={12} /></Link>} />
          <div className="space-y-3">
            {featuredPatents.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/3 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">{p.assignee} · {p.industry[0]}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.aiReport && <span className={cn('text-sm font-bold', p.aiReport.overallScore >= 80 ? 'text-success' : 'text-warning')}>{p.aiReport.overallScore}</span>}
                    <span className="text-[10px] text-text-muted">AI Score</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={getStatusBadgeClass(p.status)}>{p.status}</span>
                  <span className="text-[10px] text-text-muted">TRL {p.trl} · {p.commercialReadiness}</span>
                  {p.listingPrice && <span className="text-xs font-semibold ml-auto">{formatCurrency(p.listingPrice)}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technology coverage */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <SectionHeader title="Technology Coverage Analysis" subtitle="Portfolio vs. market availability" />
          <div className="space-y-3">
            {DOMAIN_BREAKDOWN.slice(0, 6).map((d, i) => (
              <div key={d.domain} className="flex items-center gap-3">
                <div className="w-24 text-xs text-text-muted truncate">{d.domain}</div>
                <div className="flex-1">
                  <ProgressBar value={d.count} max={52} size="md" />
                </div>
                <div className="text-xs font-semibold text-text-primary w-8 text-right">{d.count}</div>
                <div className="text-xs text-success w-16 text-right font-medium">{formatCurrency(d.revenue)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/15">
            <p className="text-xs text-accent font-medium">💡 AI Insight: Quantum Technology is an emerging gap in your portfolio with 31 available patents.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
