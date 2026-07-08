import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Search, Filter, Star, ArrowRight, Building2,
  FileText, TrendingUp, Globe, Target, Sparkles, RefreshCw,
  ChevronRight, Eye, Handshake, BarChart3, CheckCircle,
  AlertTriangle, Info, X, SlidersHorizontal, MapPin, CheckCircle2, Mail
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import type { Patent } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { SectionHeader, ProgressBar } from '../../components/ui/StatCard';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { MOCK_COMPANIES } from '../../data/mockData';

const TABS = ['Patent → Company', 'Company → Patent', 'Bulk Match', 'Match History'] as const;
type Tab = typeof TABS[number];

const SECTORS = ['All Sectors', 'Manufacturing', 'Healthcare', 'Energy', 'Agriculture', 'IT', 'Automotive', 'Defense', 'Pharmaceuticals'];
const STAGES = ['All Stages', 'Startup', 'SME', 'Large Enterprise', 'MNC', 'PSU'];

const RADAR_KEYS = ['Technology Fit', 'Market Alignment', 'Budget Match', 'Geographic Fit', 'Strategic Intent', 'Urgency'];

export const AIMatchPage: React.FC = () => {
  const { data: fetchedPatents, loading: patentsLoading } = useFetch<Patent[]>('/patents');
  const MOCK_PATENTS = fetchedPatents || [];
  
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);

  React.useEffect(() => {
    if (MOCK_PATENTS.length > 0 && !selectedPatent) {
      setSelectedPatent(MOCK_PATENTS[0]);
    }
  }, [MOCK_PATENTS, selectedPatent]);

  const { data: fetchedMatches, loading: matchesLoading } = useFetch<any[]>(selectedPatent ? `/ai/match/${selectedPatent.id}` : '', [selectedPatent?.id]);
  const matches = fetchedMatches || [];

  const [tab, setTab] = useState<Tab>('Patent → Company');
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All Sectors');
  const [stage, setStage] = useState('All Stages');
  const [minScore, setMinScore] = useState(60);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(true);

  const filteredMatches = useMemo(() => {
    const q = search.toLowerCase();
    return matches.filter(m => {
      const name = m.matchRequest?.organization?.name || '';
      return m.matchScore >= minScore &&
        (sector === 'All Sectors' || m.matchRequest?.organization?.industry === sector) &&
        (!q || name.toLowerCase().includes(q));
    });
  }, [matches, search, sector, minScore]);

  const handleRun = async () => {
    setRunning(true);
    setRan(false);
    await new Promise(r => setTimeout(r, 2000));
    setRunning(false);
    setRan(true);
  };

  const radarData = RADAR_KEYS.map((k, i) => ({
    subject: k, value: selectedMatch ? Math.round(60 + (selectedMatch.matchScore - 60) * (0.7 + i * 0.05)) : 0,
  }));

  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/25 to-transparent pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-white">AI Matchmaking Engine</h1>
                <span className="badge bg-accent/20 text-accent border border-accent/30">Phase 4</span>
              </div>
              <p className="text-navy-300 text-sm max-w-xl">AI-powered patent-to-company matching using technology alignment, market data, and strategic intent analysis</p>
            </div>
            <button onClick={handleRun} disabled={running} className="btn-primary gap-2 bg-accent hover:bg-accent-700 shrink-0">
              {running ? <><RefreshCw size={14} className="animate-spin" /> Analyzing...</> : <><Zap size={14} /> Run AI Match</>}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
              tab === t ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Patent → Company' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="card">
              <SectionHeader title="Select Patent to Match" subtitle="Choose from your portfolio" />
              <div className="relative mt-3 mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input placeholder="Search patents..." className="input pl-8 text-sm" />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {MOCK_PATENTS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPatent(p)}
                    className={cn('w-full text-left p-3 rounded-lg border transition-all',
                      selectedPatent?.id === p.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-navy-50')}>
                    <div className="flex items-start gap-2">
                      <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', selectedPatent?.id === p.id ? 'bg-accent' : 'bg-navy-300')} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-text-primary line-clamp-1">{p.title}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{p.patentNumber}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              <SectionHeader title="Match Filters" />
              <div className="space-y-4 mt-3">
                <div>
                  <label className="label">Minimum Match Score</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={95} value={minScore} onChange={e => setMinScore(+e.target.value)} className="flex-1 accent-accent" />
                    <span className="text-sm font-bold text-accent w-10">{minScore}%</span>
                  </div>
                </div>
                <div>
                  <label className="label">Industry Sector</label>
                  <select value={sector} onChange={e => setSector(e.target.value)} className="input text-sm">
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-text-primary mb-1">
              {matchesLoading ? 'Analyzing matches...' : `${filteredMatches.length} Companies Matched`}
            </h3>
            {matchesLoading ? (
              <div className="p-12 text-center text-text-muted">Loading matches...</div>
            ) : filteredMatches.map((match, i) => (
              <motion.div key={match.id} variants={item} className="bg-white rounded-xl border p-5 hover:border-accent/40 transition-colors cursor-pointer relative group" onClick={() => setSelectedMatch(match)}>
                <div className="absolute top-5 right-5 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm"
                     style={{ borderColor: match.matchScore >= 90 ? '#10B981' : match.matchScore >= 75 ? '#F59E0B' : '#EF4444' }}>
                  {match.matchScore}%
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center font-bold text-navy-600 text-lg">
                    {match.matchRequest?.organization?.name.charAt(0) || 'O'}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{match.matchRequest?.organization?.name || 'Unknown'}</h3>
                    <p className="text-sm text-text-muted">{match.matchRequest?.organization?.industry || 'Technology'} • {match.matchRequest?.organization?.stage || 'Enterprise'}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Match Reasons</div>
                  <ul className="space-y-1.5">
                    {match.reasons?.slice(0, 2).map((reason: string, j: number) => (
                      <li key={j} className="flex gap-2 text-sm text-text-secondary">
                        <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 btn-primary py-2 h-auto text-sm">Draft Proposal</button>
                  <button className="px-3 border rounded-lg text-text-muted hover:text-text-primary transition-colors"><Mail size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            {selectedMatch ? (
              <motion.div key={selectedMatch.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <div className="card">
                  <div className="text-center mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-navy-100 flex items-center justify-center text-lg font-black text-navy-600 mx-auto mb-2">
                      {selectedMatch.matchRequest?.organization?.name.slice(0, 2).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">{selectedPatent?.title}</h2>
                    <h3 className="text-sm font-bold text-text-primary">{selectedMatch.matchRequest?.organization?.name}</h3>
                    <p className="text-[11px] text-text-muted">{selectedMatch.matchRequest?.organization?.industry}</p>
                    <div className={cn('text-3xl font-black mt-2', selectedMatch.matchScore >= 85 ? 'text-success' : 'text-accent')}>
                      {selectedMatch.matchScore}%
                    </div>
                    <p className="text-[11px] text-text-muted">Match Score</p>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7, fill: '#94A3B8' }} />
                      <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="space-y-2 mt-2">
                    {[
                      { l: 'Deal Probability', v: `${selectedMatch.dealProbability || 60}%`, c: 'text-success' },
                      { l: 'Est. Revenue', v: formatCurrency(selectedMatch.estimatedRevenue || 500000) },
                      { l: 'Decision Maker', v: selectedMatch.decisionMaker || 'CTO / VP of Engineering' },
                      { l: 'Location', v: selectedMatch.headquarters || selectedMatch.matchRequest?.organization?.country || 'Global' },
                    ].map(item => (
                      <div key={item.l} className="flex justify-between text-xs">
                        <span className="text-text-muted">{item.l}</span>
                        <span className={cn('font-semibold', item.c || 'text-text-primary')}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Why this match?</p>
                  <div className="space-y-2">
                    {selectedMatch.reasons.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-text-primary">
                        <CheckCircle size={11} className="text-success shrink-0 mt-0.5" /> {r}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertTriangle size={10} className="text-warning" /> Risk
                    </p>
                    <div className="space-y-1 text-xs text-text-muted">
                      {(selectedMatch.risks || []).map((r: string, i: number) => (
                        <p key={i}>• {r}</p>
                      ))}
                      {(!selectedMatch.risks || selectedMatch.risks.length === 0) && <p>No major risks identified.</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link to={`/ai-analysis/${selectedPatent?.id}`} className="btn-secondary text-xs justify-center gap-1"><Brain size={13} /> AI Report</Link>
                </div>
              </motion.div>
            ) : (
              <div className="card text-center">
                <Target size={24} className="text-text-muted mx-auto mb-2" />
                <p className="text-xs font-medium text-text-muted">Select a match to see detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Company → Patent' && (
        <div className="grid lg:grid-cols-3 gap-4">
          {MOCK_COMPANIES.slice(0, 9).map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="card card-hover cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-600 shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{c.name}</div>
                    <div className="text-[11px] text-text-muted">{c.industry}</div>
                  </div>
                </div>
                <div className="text-xs text-text-muted line-clamp-2 mb-3">{c.technologyNeeds.join(', ')}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-success">{Math.floor(Math.random() * 8 + 3)} patent matches</span>
                  <button className="btn-primary text-xs gap-1"><Brain size={12} /> Find Patents</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {(tab === 'Bulk Match' || tab === 'Match History') && (
        <div className="card text-center py-16">
          <Zap size={32} className="text-accent mx-auto mb-4" />
          <h3 className="text-base font-bold text-text-primary mb-2">{tab === 'Bulk Match' ? 'Bulk Match Engine' : 'Match History'}</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">{tab === 'Bulk Match' ? 'Match your entire portfolio against the company database in one run. Coming in Phase 5.' : '48 past matches with outcomes and conversion tracking. Coming in Phase 5.'}</p>
        </div>
      )}
    </div>
  );
};
