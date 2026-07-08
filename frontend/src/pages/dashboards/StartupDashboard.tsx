import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Search, Star, Handshake, Brain, TrendingUp, Globe, ArrowRight, Bookmark, Zap } from 'lucide-react';
import { StatCard, SectionHeader, ScoreRing, ProgressBar, Badge } from '../../components/ui/StatCard';
import { MOCK_PATENTS, MATCH_SCORES_DATA } from '../../data/mockData';
import { formatCurrency, getStatusBadgeClass } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NEED_MATCH_DATA = [
  { tech: 'NLP', available: 24, match: 18 },
  { tech: 'Computer Vision', available: 19, match: 14 },
  { tech: 'Edge AI', available: 12, match: 9 },
  { tech: 'Biotech', available: 8, match: 3 },
  { tech: 'IoT', available: 31, match: 22 },
];

export const StartupDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const profile = user?.profile as { company: string; industry: string; stage: string; fundingRaised: number } | undefined;
  const recommendedPatents = MOCK_PATENTS.filter((p) => p.isListed).slice(0, 4);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Technology Scouting</h1>
            <p className="text-text-muted text-sm mt-1">{profile?.company || 'NexaGen AI'} · {profile?.stage} · Find IP that accelerates your product</p>
          </div>
          <div className="flex gap-2">
            <Link to="/marketplace" className="btn-primary text-xs">Browse All Patents</Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Saved Patents', value: 23, icon: <Bookmark size={15} />, change: 5, trend: 'up' as const },
          { label: 'Licensing Requests', value: 4, icon: <Handshake size={15} />, change: 33, trend: 'up' as const },
          { label: 'AI Recommendations', value: 89, icon: <Brain size={15} />, change: 12, trend: 'up' as const },
          { label: 'Avg Match Score', value: '87%', icon: <Zap size={15} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="this week" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2">
          <SectionHeader title="AI-Recommended Patents" subtitle="Matched to your technology needs" action={<Link to="/marketplace" className="btn-ghost text-xs gap-1">View all <ArrowRight size={12} /></Link>} />
          <div className="space-y-3">
            {recommendedPatents.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/3 transition-all cursor-pointer group">
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent/20 transition-colors">
                  <Brain size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{p.assignee} · {p.technologyDomain}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={getStatusBadgeClass(p.status)}>{p.status}</span>
                    <span className="text-[10px] text-text-muted">TRL {p.trl}</span>
                    {p.listingPrice && <span className="text-[10px] font-semibold text-text-primary ml-auto">{formatCurrency(p.listingPrice)}</span>}
                  </div>
                </div>
                {p.aiReport && (
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <ScoreRing score={p.aiReport.overallScore} size={44} />
                    <span className="text-[9px] text-text-muted">match</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech needs match */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <SectionHeader title="Technology Match" subtitle="Available vs. your needs" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={NEED_MATCH_DATA} layout="vertical" barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tech" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="available" fill="#E2E8F0" name="Available" radius={[0, 2, 2, 0]} />
              <Bar dataKey="match" fill="#2563EB" name="Match" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-text-muted text-center">89 patents match your technology stack</div>
        </motion.div>
      </div>

      {/* Top Matches */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <SectionHeader title="Top AI Match Companies to Connect With" subtitle="They hold patents aligned with your needs" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MATCH_SCORES_DATA.slice(0, 4).map((m, i) => (
            <div key={i} className="p-3 rounded-lg border border-border hover:border-accent/40 hover:shadow-card-hover transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">{m.company}</span>
                <span className="text-sm font-bold text-success">{m.score}%</span>
              </div>
              <div className="text-[11px] text-text-muted">{m.industry} · {m.patents} patents</div>
              <ProgressBar value={m.score} className="mt-2" color="#10B981" />
              <button className="btn-ghost text-[11px] mt-2 w-full justify-center text-accent">Request Introduction</button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
