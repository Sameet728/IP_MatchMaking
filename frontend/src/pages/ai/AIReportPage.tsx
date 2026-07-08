import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowLeft, Download, Share2, RefreshCw, CheckCircle,
  AlertTriangle, TrendingUp, TrendingDown, Minus, Globe, Building2,
  DollarSign, Handshake, BarChart3, Shield, Lightbulb, Target,
  ChevronDown, ChevronUp, Star, Zap, FileText, Clock, Info, Printer
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import { cn, formatCurrency } from '../../lib/utils';
import { ScoreRing, ProgressBar, SectionHeader } from '../../components/ui/StatCard';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area
} from 'recharts';

// ─── MOCK EXTENDED AI DATA ──────────────────────────────────
const getExtendedReport = (patentId: string) => ({
  swot: {
    strengths: [
      'Novel approach with 87th percentile novelty score — significantly above industry average',
      'Strong patent claims across 8 independent claims and 34 dependent claims',
      'High TRL (7+) indicating near-commercial readiness with validated prototype',
      'First-mover advantage with no direct prior art in 3 out of 5 core claims',
    ],
    weaknesses: [
      'Geographic coverage limited to India and PCT — no US/EU protection yet',
      'Short patent family (2 patents) compared to industry competitors with 8–15 family members',
      'High commercialization cost estimated at $800K–$1.2M for full market entry',
    ],
    opportunities: [
      'Addressable market of $24B growing at 18% CAGR — ideal entry window is 2024–2026',
      'Eligible for DST TARE, Startup India, and 3 state government innovation schemes',
      'Partnership opportunity with 4 of India\'s top 10 companies in this sector',
      'Export potential to ASEAN markets where this technology has zero competition',
    ],
    threats: [
      'Samsung and LG both have active R&D programs in adjacent technology space',
      'Patent expiry in 2041 — may face generic competition if licensing delayed beyond 2030',
      'Regulatory uncertainty in 2 of the 5 target industries',
    ],
  },
  marketData: {
    globalTAM: 24000000000,
    indianSAM: 2800000000,
    targetSOM: 420000000,
    growthRate: 18.3,
    competitorCount: 7,
    entryBarrier: 'Medium',
    timeToMarket: '12–18 months',
    competitorMap: [
      { name: 'Samsung SDI', strength: 91, geography: 'Global', threat: 'High' },
      { name: 'LG Chem', strength: 88, geography: 'Korea/US', threat: 'High' },
      { name: 'Tata Chemicals', strength: 72, geography: 'India', threat: 'Medium' },
      { name: 'ISRO Labs', strength: 65, geography: 'India', threat: 'Low' },
      { name: 'CSIR Startup', strength: 48, geography: 'India', threat: 'Low' },
    ],
    revenueProjection: [
      { year: '2025', conservative: 800000, moderate: 1500000, optimistic: 2800000 },
      { year: '2026', conservative: 1800000, moderate: 3200000, optimistic: 5500000 },
      { year: '2027', conservative: 3500000, moderate: 6500000, optimistic: 11000000 },
      { year: '2028', conservative: 6000000, moderate: 12000000, optimistic: 20000000 },
      { year: '2029', conservative: 9500000, moderate: 19000000, optimistic: 32000000 },
    ],
  },
  licensing: {
    recommendedModel: 'Exclusive License with Sublicensing Rights',
    suggestedRoyaltyRate: '4.5–6% of net sales',
    suggestedUpfrontFee: 1500000,
    negotiationPoints: [
      'Minimum annual royalty guarantee of $250,000',
      'Sublicensing rights with 30% pass-through to licensor',
      'Field-of-use restriction to Manufacturing and Healthcare sectors',
      'Milestone payments: $500K at product launch, $1M at $10M revenue',
      'IP improvement assignment clause — any improvements belong to licensor',
    ],
    dealTimeline: '90–120 days from NDA to signed agreement',
  },
  ipRisk: {
    overallRisk: 'Low',
    riskScore: 18,
    factors: [
      { factor: 'Claim Validity', risk: 'Low', score: 85, note: 'Strong prior art search completed. 94% claim validity probability.' },
      { factor: 'Infringement Exposure', risk: 'Low', score: 82, note: 'No active overlapping patents from competitors.' },
      { factor: 'Maintenance Risk', risk: 'Very Low', score: 90, note: 'Filing fees paid through 2026. Renewal schedule active.' },
      { factor: 'Litigation Exposure', risk: 'Medium', score: 68, note: 'Samsung has filed 2 similar patents in adjacent claims space.' },
      { factor: 'Jurisdiction Risk', risk: 'Low', score: 78, note: 'Indian courts favorable for IP enforcement since 2020 reforms.' },
    ],
  },
});

const SCORE_COLORS: Record<string, string> = {
  noveltyScore: '#8B5CF6', commercialScore: '#2563EB', marketScore: '#10B981',
  patentStrengthScore: '#0F172A', investmentReadiness: '#F59E0B', licensingReadiness: '#06B6D4',
};
const SCORE_LABELS: Record<string, string> = {
  noveltyScore: 'Novelty', commercialScore: 'Commercial', marketScore: 'Market Fit',
  patentStrengthScore: 'Strength', investmentReadiness: 'Investment', licensingReadiness: 'Licensing',
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: string }> =
  ({ title, icon, children, defaultOpen = true, badge }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-2">
            <div className="text-accent">{icon}</div>
            <h2 className="text-base font-bold text-text-primary">{title}</h2>
            {badge && <span className="badge badge-accent">{badge}</span>}
          </div>
          {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden">
              <div className="mt-4 pt-4 border-t border-border">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

const SWOT_COLORS = {
  strengths: { bg: 'bg-success/5', border: 'border-success/20', text: 'text-success', icon: <TrendingUp size={14} />, label: 'Strengths' },
  weaknesses: { bg: 'bg-danger/5', border: 'border-danger/20', text: 'text-danger', icon: <TrendingDown size={14} />, label: 'Weaknesses' },
  opportunities: { bg: 'bg-accent/5', border: 'border-accent/20', text: 'text-accent', icon: <Lightbulb size={14} />, label: 'Opportunities' },
  threats: { bg: 'bg-warning/5', border: 'border-warning/20', text: 'text-warning', icon: <AlertTriangle size={14} />, label: 'Threats' },
};

export const AIReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: patentData, loading } = useFetch<any>(`/patents/${id}`);
  const patent = patentData || null;
  const report = patent?.aiReport || null;
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (patent && !report) {
      setGenerating(true);
    } else {
      setGenerating(false);
    }
  }, [patent, report]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/patents/${id}/ai-report/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Report_${patent.patentNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (loading) return <div className="p-6">Loading AI Report...</div>;
  if (!patent) return <div className="p-6">Patent not found</div>;

  const extended = getExtendedReport(patent.id);

  const radarData = report ? Object.keys(SCORE_LABELS).map(k => ({
    subject: SCORE_LABELS[k], value: report[k as keyof typeof report] as number,
  })) : [];

  useEffect(() => {
    if (generating) {
      const t = setTimeout(() => setGenerating(false), 3000);
      return () => clearTimeout(t);
    }
  }, [generating]);

  if (generating) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Brain size={36} className="text-accent animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">AI Analysis in Progress</h2>
          <p className="text-text-muted text-sm mb-6">Analyzing patent claims, conducting market research, and generating commercial intelligence...</p>
          <div className="space-y-3 text-left">
            {['Parsing patent claims and abstract...', 'Conducting novelty analysis...', 'Scanning market landscape...', 'Identifying potential licensees...', 'Generating SWOT analysis...'].map((task, i) => (
              <motion.div key={task} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }}
                className="flex items-center gap-2 text-xs text-text-muted">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 + 0.3 }}>
                  <CheckCircle size={12} className="text-success" />
                </motion.div>
                {task}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link to="/ai-analysis" className="hover:text-accent flex items-center gap-1"><ArrowLeft size={12} /> AI Engine</Link>
        <span>/</span>
        <Link to={`/patents/${patent.id}`} className="hover:text-accent">{patent.patentNumber}</Link>
        <span>/</span>
        <span className="text-text-primary">AI Report</span>
      </div>

      {/* Report header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Brain size={22} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-accent">AI-Powered Report</span>
                  <span className="text-[11px] text-text-muted flex items-center gap-1"><Clock size={10} /> Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h1 className="text-lg font-bold text-text-primary max-w-3xl leading-tight">{patent.title}</h1>
                <p className="text-xs text-text-muted mt-1">{patent.patentNumber} · {patent.assignee} · {patent.technologyDomain}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setGenerating(true)} className="btn-ghost text-xs gap-1"><RefreshCw size={13} /> Refresh</button>
                <button onClick={() => window.print()} className="btn-ghost text-xs gap-1"><Printer size={13} /> Print</button>
                <button onClick={handleDownload} className="btn-secondary text-xs gap-1"><Download size={13} /> Export PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* Score overview bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5 pt-5 border-t border-border">
            {report && Object.entries(SCORE_LABELS).map(([key, label]) => {
              const score = report[key as keyof typeof report] as number;
              return (
                <div key={key} className="text-center">
                <div className="text-2xl font-black" style={{ color: SCORE_COLORS[key] }}>{score}</div>
                <div className="text-[11px] text-text-muted font-medium mt-0.5">{label}</div>
                <div className="mt-1.5 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: SCORE_COLORS[key] }}
                    initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main content — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* SWOT Analysis */}
          <SectionCard title="SWOT Analysis" icon={<Target size={18} />} badge="Auto-generated">
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.entries(SWOT_COLORS) as [keyof typeof SWOT_COLORS, typeof SWOT_COLORS[keyof typeof SWOT_COLORS]][]).map(([key, style]) => (
                <div key={key} className={cn('p-4 rounded-xl border', style.bg, style.border)}>
                  <div className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3', style.text)}>
                    {style.icon} {style.label}
                  </div>
                  <ul className="space-y-2">
                    {extended.swot[key].map((item, i) => (
                      <li key={i} className="text-xs text-text-primary leading-relaxed flex items-start gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5', style.text.replace('text', 'bg'))} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Market Analysis */}
          <SectionCard title="Market Opportunity Analysis" icon={<Globe size={18} />}>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Global TAM', value: formatCurrency(extended.marketData.globalTAM), hint: 'Total Addressable Market', color: 'text-text-primary' },
                { label: 'Indian SAM', value: formatCurrency(extended.marketData.indianSAM), hint: 'Serviceable Market', color: 'text-accent' },
                { label: 'Target SOM', value: formatCurrency(extended.marketData.targetSOM), hint: '5-year Obtainable Market', color: 'text-success' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-navy-50 rounded-lg border border-border text-center">
                  <div className={cn('text-xl font-bold', m.color)}>{m.value}</div>
                  <div className="text-xs font-semibold text-text-primary mt-0.5">{m.label}</div>
                  <div className="text-[11px] text-text-muted">{m.hint}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mb-3">
              <div className="text-xs text-text-muted">CAGR: <span className="font-bold text-success">{extended.marketData.growthRate}%</span></div>
              <div className="text-xs text-text-muted">Competitors: <span className="font-bold text-text-primary">{extended.marketData.competitorCount}</span></div>
              <div className="text-xs text-text-muted">Entry Barrier: <span className="font-bold text-warning">{extended.marketData.entryBarrier}</span></div>
              <div className="text-xs text-text-muted">Time to Market: <span className="font-bold text-text-primary">{extended.marketData.timeToMarket}</span></div>
            </div>

            {/* Revenue projection chart */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">5-Year Revenue Projection</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={extended.marketData.revenueProjection}>
                  <defs>
                    <linearGradient id="cons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mod" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="opt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: any, name) => [`$${(Number(v) / 1000000).toFixed(1)}M`, name]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Area type="monotone" dataKey="optimistic" name="Optimistic" stroke="#10B981" fill="url(#opt)" strokeWidth={2} />
                  <Area type="monotone" dataKey="moderate" name="Moderate" stroke="#F59E0B" fill="url(#mod)" strokeWidth={2} />
                  <Area type="monotone" dataKey="conservative" name="Conservative" stroke="#EF4444" fill="url(#cons)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Competitor landscape */}
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Competitive Landscape</p>
            <div className="space-y-2.5">
              {extended.marketData.competitorMap.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-text-primary font-medium truncate">{c.name}</div>
                  <ProgressBar value={c.strength} className="flex-1" color={c.threat === 'High' ? '#EF4444' : c.threat === 'Medium' ? '#F59E0B' : '#10B981'} />
                  <span className="text-xs text-text-muted w-14 shrink-0">{c.geography}</span>
                  <span className={cn('badge text-[10px] w-14 justify-center',
                    c.threat === 'High' ? 'badge-danger' : c.threat === 'Medium' ? 'badge-warning' : 'badge-success')}>
                    {c.threat}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Licensing Strategy */}
          <SectionCard title="Licensing Strategy" icon={<Handshake size={18} />}>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20 col-span-2">
                <div className="text-xs font-semibold text-accent mb-1">Recommended Model</div>
                <div className="text-sm font-bold text-text-primary">{extended.licensing.recommendedModel}</div>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg border border-border">
                <div className="text-xs font-semibold text-text-muted mb-1">Suggested Upfront Fee</div>
                <div className="text-lg font-bold text-success">{formatCurrency(extended.licensing.suggestedUpfrontFee)}</div>
                <div className="text-[11px] text-text-muted">+ {extended.licensing.suggestedRoyaltyRate}</div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Negotiation Points</p>
              <div className="space-y-2">
                {extended.licensing.negotiationPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-text-primary">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent shrink-0">{i + 1}</div>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-warning/5 rounded-lg border border-warning/20 flex items-start gap-2">
              <Clock size={13} className="text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">Expected deal timeline: <span className="font-semibold text-warning">{extended.licensing.dealTimeline}</span></p>
            </div>
          </SectionCard>

          {/* IP Risk Analysis */}
          <SectionCard title="IP Risk Assessment" icon={<Shield size={18} />} badge={`Risk: ${extended.ipRisk.overallRisk}`}>
            <div className="flex items-center gap-4 mb-5">
              <ScoreRing score={100 - extended.ipRisk.riskScore} size={70} label="Safety Score" />
              <div>
                <div className="text-2xl font-bold text-success">{extended.ipRisk.overallRisk} Risk</div>
                <div className="text-sm text-text-muted">Risk index: {extended.ipRisk.riskScore}/100</div>
                <div className="text-xs text-text-muted mt-1">Strong IP position with minor competitor exposure</div>
              </div>
            </div>
            <div className="space-y-3">
              {extended.ipRisk.factors.map(f => (
                <div key={f.factor} className="p-3 bg-navy-50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-primary">{f.factor}</span>
                    <span className={cn('badge text-[10px]', f.risk === 'Very Low' || f.risk === 'Low' ? 'badge-success' : f.risk === 'Medium' ? 'badge-warning' : 'badge-danger')}>
                      {f.risk}
                    </span>
                  </div>
                  <ProgressBar value={f.score} color={f.score >= 80 ? '#10B981' : f.score >= 65 ? '#F59E0B' : '#EF4444'} />
                  <p className="text-[11px] text-text-muted mt-2 flex items-start gap-1.5"><Info size={10} className="shrink-0 mt-0.5" />{f.note}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Overall score card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card text-center">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Overall AI Score</p>
            <ScoreRing score={report?.overallScore || 0} size={110} label="Commercial Value" />
            <div className="mt-3">
              <p className={cn('text-sm font-bold', (report?.overallScore || 0) >= 85 ? 'text-success' : (report?.overallScore || 0) >= 70 ? 'text-accent' : 'text-warning')}>
                {(report?.overallScore || 0) >= 85 ? '⭐ Top Tier Patent' : (report?.overallScore || 0) >= 70 ? '✅ Strong Commercial Value' : '⚡ Moderate Potential'}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={160} className="mt-3">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Potential buyers */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
            <SectionHeader title="Top Potential Buyers" subtitle="AI-matched companies" />
            <div className="space-y-3 mt-2">
              {report?.topBuyers ? (report.topBuyers as any[]).map((b: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/3 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-text-primary">{b.company}</div>
                      <div className="text-[11px] text-text-muted">{b.industry}</div>
                    </div>
                    <div className={cn('text-sm font-black', b.matchScore >= 85 ? 'text-success' : 'text-accent')}>{b.matchScore}%</div>
                  </div>
                  <ProgressBar value={b.matchScore} color={b.matchScore >= 85 ? '#10B981' : '#2563EB'} />
                  <div className="text-xs text-text-muted mt-1 leading-relaxed">Match: {b.matchReason || b.reason}</div>
                </div>
              )) : <div className="text-sm text-text-muted">No buyers found</div>}
            </div>
            <button className="btn-primary w-full text-xs mt-3">Contact All Matches</button>
          </motion.div>

          {/* Quick flags */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
            <SectionHeader title="AI Flags & Highlights" />
            <div className="space-y-2.5 mt-2">
              {[
                { icon: <CheckCircle size={13} className="text-success" />, text: 'Ready for immediate licensing — TRL 7', type: 'success' },
                { icon: <TrendingUp size={13} className="text-accent" />, text: 'Revenue potential exceeds $10M by 2027', type: 'info' },
                { icon: <Star size={13} className="text-warning" />, text: 'Eligible for 3 government grant schemes', type: 'warning' },
                { icon: <AlertTriangle size={13} className="text-warning" />, text: 'File US patent before Q3 2024 to protect market', type: 'warning' },
                { icon: <Globe size={13} className="text-accent" />, text: 'ASEAN expansion opportunity identified', type: 'info' },
              ].map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-primary">
                  <span className="shrink-0 mt-0.5">{flag.icon}</span>
                  {flag.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monetization options */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="card">
            <SectionHeader title="Technical Evaluation" />
            <div className="space-y-2 mt-2">
              {report?.monetizationOptions ? (report.monetizationOptions as string[]).map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-navy-50 rounded-lg border border-border">
                  <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">{i + 1}</div>
                  <span className="text-xs text-text-primary">{opt}</span>
                </div>
              )) : <div className="text-sm text-text-muted">No options available</div>}
            </div>
          </motion.div>

          {/* Government schemes */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="card">
            <SectionHeader title="Gov. Funding Eligible" subtitle={`${report?.governmentSchemes?.length || 0} schemes`} />
            <div className="space-y-2 mt-2">
              {report?.governmentSchemes ? (report.governmentSchemes as string[]).map((scheme: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-primary">
                  <CheckCircle size={11} className="text-success shrink-0" /> {scheme}
                </div>
              )) : <div className="text-sm text-text-muted">No schemes identified</div>}
            </div>
            <button className="btn-secondary w-full text-xs mt-3">Apply for Grants</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
