import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Zap, TrendingUp, Star, Clock, CheckCircle,
  ArrowRight, Filter, Search, AlertTriangle, BarChart3,
  Globe, Cpu, RefreshCw
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import type { Patent } from '../../types';
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils';
import { StatCard, SectionHeader, ProgressBar, ScoreRing } from '../../components/ui/StatCard';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

const DOMAIN_SCORES = [
  { domain: 'AI / ML', avgScore: 87, count: 14 },
  { domain: 'Biotech', avgScore: 82, count: 9 },
  { domain: 'Clean Tech', avgScore: 78, count: 7 },
  { domain: 'Materials', avgScore: 74, count: 6 },
  { domain: 'Semiconductor', avgScore: 71, count: 5 },
  { domain: 'Healthcare', avgScore: 85, count: 8 },
];

const SCORE_DISTRIBUTION = [
  { range: '90-100', count: 4, color: '#10B981' },
  { range: '80-89', count: 11, color: '#2563EB' },
  { range: '70-79', count: 16, color: '#F59E0B' },
  { range: '60-69', count: 9, color: '#F97316' },
  { range: '<60', count: 3, color: '#EF4444' },
];

const QUEUE_DATA = [
  { patent: 'Quantum Encryption for 5G Networks', domain: 'Semiconductor', status: 'analyzing', progress: 67 },
  { patent: 'Biodegradable Nano-composites', domain: 'Materials Science', status: 'queued', progress: 0 },
  { patent: 'Federated Learning Edge AI', domain: 'AI / ML', status: 'queued', progress: 0 },
];

export const AIAnalysisDashboard: React.FC = () => {
  const { data: fetchedPatents, loading: patentsLoading } = useFetch<Patent[]>('/patents');
  const patents = fetchedPatents || [];
  
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);

  React.useEffect(() => {
    if (patents.length > 0 && !selectedPatent) {
      setSelectedPatent(patents[0]);
    }
  }, [patents, selectedPatent]);

  const { data: aiReport, loading: reportLoading, refetch } = useFetch<any>(selectedPatent ? `/ai/report/${selectedPatent.id}` : '', [selectedPatent?.id]);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [filterDomain, setFilterDomain] = useState('All');
  const [search, setSearch] = useState('');

  const handleAnalyze = async () => {
    if (!selectedPatent) return;
    setAnalyzing(true);
    try {
      await api.post(`/ai/analyze/${selectedPatent.id}`);
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/ai/analyze/${selectedPatent.id}/status`);
          if (res.data.success) {
            const status = res.data.data?.status;
            if (status === 'completed') {
              clearInterval(interval);
              await refetch();
              setAnalyzing(false);
            } else if (status === 'failed') {
              clearInterval(interval);
              setAnalyzing(false);
              alert('AI Analysis failed.');
            }
          }
        } catch (e) {}
      }, 3000);
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
      alert('Failed to start AI Analysis');
    }
  };

  const analyzedPatents = patents.filter(p => p.aiReport).filter(p => {
    const q = search.toLowerCase();
    return (!q || p.title.toLowerCase().includes(q)) && (filterDomain === 'All' || p.technologyDomain === filterDomain);
  });

  const SCATTER_DATA = analyzedPatents.map(p => ({
    x: p.aiReport!.commercialScore,
    y: p.aiReport!.noveltyScore,
    score: p.aiReport!.overallScore,
    name: p.title.slice(0, 30) + '...',
    id: p.id,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Brain size={16} className="text-accent" />
              </div>
              <h1 className="page-title">AI Intelligence Engine</h1>
            </div>
            <p className="text-text-muted text-sm">Commercial analysis, scoring, and strategic recommendations for your IP portfolio</p>
          </div>
          <div className="flex gap-2">
            <Link to="/patents" className="btn-secondary text-xs">Add Patents to Queue</Link>
            <button className="btn-primary text-xs gap-1"><RefreshCw size={13} /> Run Batch Analysis</button>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Patents Analyzed', value: analyzedPatents.length, icon: <CheckCircle size={14} />, change: 18, trend: 'up' as const },
          { label: 'Avg. Overall Score', value: '83/100', icon: <Star size={14} /> },
          { label: 'High Value (>80)', value: 15, icon: <Zap size={14} />, change: 25, trend: 'up' as const },
          { label: 'Analysis Queue', value: 3, icon: <Clock size={14} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="this month" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Novelty vs Commercial scatter */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card lg:col-span-2">
          <SectionHeader title="Portfolio Map: Novelty vs. Commercial Potential" subtitle="Each dot = one patent" />
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" dataKey="x" name="Commercial" domain={[50, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Commercial Score', position: 'bottom', fontSize: 10, fill: '#94A3B8', offset: -5 }} />
              <YAxis type="number" dataKey="y" name="Novelty" domain={[50, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} label={{ value: 'Novelty', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-white border border-border rounded-lg p-2 shadow-sm text-xs">
                    <p className="font-semibold text-text-primary mb-1">{payload[0]?.payload.name}</p>
                    <p className="text-text-muted">Commercial: {payload[0]?.payload.x}</p>
                    <p className="text-text-muted">Novelty: {payload[0]?.payload.y}</p>
                    <p className="text-accent font-semibold">Score: {payload[0]?.payload.score}</p>
                  </div>
                ) : null} />
              <Scatter data={SCATTER_DATA} fill="#2563EB" fillOpacity={0.7}>
                {SCATTER_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 85 ? '#10B981' : entry.score >= 70 ? '#2563EB' : '#F59E0B'} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center text-[11px] mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Score ≥ 85</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Score 70-85</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" /> Score &lt; 70</span>
          </div>
        </motion.div>

        {/* Score distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <SectionHeader title="Score Distribution" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SCORE_DISTRIBUTION} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="count" name="Patents" radius={[3, 3, 0, 0]}>
                {SCORE_DISTRIBUTION.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {SCORE_DISTRIBUTION.map(d => (
              <div key={d.range} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-text-muted flex-1">Score {d.range}</span>
                <span className="text-xs font-bold text-text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Domain scores */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <SectionHeader title="Average Score by Domain" />
          <div className="space-y-3">
            {DOMAIN_SCORES.map(d => (
              <div key={d.domain}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-muted font-medium">{d.domain}</span>
                  <span className="text-text-primary font-bold">{d.avgScore} <span className="text-text-muted font-normal">({d.count})</span></span>
                </div>
                <ProgressBar value={d.avgScore} color={d.avgScore >= 85 ? '#10B981' : d.avgScore >= 75 ? '#2563EB' : '#F59E0B'} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analysis queue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <SectionHeader title="Analysis Queue" subtitle="Pending & in progress" />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {patents.map(p => (
              <button key={p.id} onClick={() => setSelectedPatent(p)}
                className={cn('w-full text-left p-3 rounded-lg border transition-all',
                  selectedPatent?.id === p.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-navy-50')}>
                <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{p.patentNumber}</div>
              </button>
            ))}
          </div>
          <button className="btn-ghost text-xs mt-3 w-full">Add to Queue</button>
        </motion.div>

        {/* Top rated patents */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <SectionHeader title="Top Rated Patents" subtitle="Highest AI scores" action={<Link to="/ai-analysis/all" className="btn-ghost text-xs">View all</Link>} />
          <div className="space-y-2">
            {patents.filter(p => p.aiReport).sort((a, b) => (b.aiReport!.overallScore) - (a.aiReport!.overallScore)).slice(0, 5).map((p, i) => (
              <Link to={`/ai-analysis/${p.id}`} key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-navy-50 transition-colors group">
                <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-text-muted">{p.technologyDomain}</div>
                </div>
                <ScoreRing score={p.aiReport!.overallScore} size={36} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Patent list with AI scores */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionHeader title="All Analyzed Patents" subtitle={`${analyzedPatents.length} patents with AI reports`} />
          <div className="flex gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-8 text-sm w-40" />
            </div>
            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="input text-sm w-44">
              <option value="All">All Domains</option>
              {[...new Set(patents.map(p => p.technologyDomain))].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patent</th>
                <th>Domain</th>
                <th>Overall</th>
                <th>Novelty</th>
                <th>Commercial</th>
                <th>Market Fit</th>
                <th>Strength</th>
                <th>Potential Buyers</th>
                <th>Est. Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {analyzedPatents.slice(0, 15).map(p => (
                <tr key={p.id}>
                  <td className="max-w-[220px]">
                    <div className="font-semibold text-xs line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-text-muted">{p.patentNumber}</div>
                  </td>
                  <td className="text-xs text-text-muted whitespace-nowrap">{p.technologyDomain}</td>
                  <td>
                    <div className={cn('text-sm font-bold', p.aiReport!.overallScore >= 80 ? 'text-success' : p.aiReport!.overallScore >= 65 ? 'text-warning' : 'text-danger')}>
                      {p.aiReport!.overallScore}
                    </div>
                  </td>
                  {[p.aiReport!.noveltyScore, p.aiReport!.commercialScore, p.aiReport!.marketFitScore, p.aiReport!.legalStrength].map((score, i) => (
                    <td key={i}>
                      <div className="flex items-center gap-1.5">
                        <ProgressBar value={score} className="w-12" />
                        <span className="text-xs text-text-muted">{score}</span>
                      </div>
                    </td>
                  ))}
                  <td className="text-xs text-text-muted">{p.aiReport!.potentialBuyers?.length || 0} matched</td>
                  <td className="text-xs font-semibold text-text-primary whitespace-nowrap">
                    {formatCurrency(p.aiReport!.valuationEstimate?.mid || 0)}
                  </td>
                  <td>
                    <Link to={`/ai-analysis/${p.id}`} className="btn-ghost text-xs gap-1 whitespace-nowrap">
                      <Brain size={11} /> Report <ArrowRight size={10} />
                    </Link>
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
