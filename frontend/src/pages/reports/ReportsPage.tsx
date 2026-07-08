import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Plus, Search, Calendar, BarChart3,
  Brain, TrendingUp, DollarSign, Building2, Handshake,
  CheckCircle, Clock, Eye, Printer, Share2, Trash2,
  ArrowRight, RefreshCw, Filter, Star
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

// ─── REPORT DATA ──────────────────────────────────────────
const REPORT_TYPES = [
  { id: 'ai-portfolio', icon: Brain, label: 'AI Portfolio Report', desc: 'Full AI analysis of your entire patent portfolio', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'valuation', icon: DollarSign, label: 'Valuation Report', desc: 'Market-based valuation for all listed patents', color: 'text-success', bg: 'bg-success/10' },
  { id: 'commercialization', icon: TrendingUp, label: 'Commercialization Report', desc: 'Licensing funnel performance and revenue forecasts', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'buyer-match', icon: Building2, label: 'Buyer Match Report', desc: 'Top 20 company recommendations with match scores', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'deal-summary', icon: Handshake, label: 'Deal Summary Report', desc: 'All active deals, milestones, and projections', color: 'text-navy-700', bg: 'bg-navy-100' },
  { id: 'royalty', icon: BarChart3, label: 'Royalty Collection Report', desc: 'Received, pending, and overdue payments breakdown', color: 'text-orange-600', bg: 'bg-orange-50' },
];

interface ReportRecord {
  id: string;
  type: string;
  name: string;
  generated: string;
  period: string;
  pages: number;
  status: 'ready' | 'generating' | 'scheduled';
  format: 'PDF' | 'Excel' | 'CSV';
  size: string;
  starred: boolean;
}

const REPORTS: ReportRecord[] = [
  { id: 'r1', type: 'ai-portfolio', name: 'AI Portfolio Report — Q2 2024', generated: new Date(Date.now() - 86400000).toISOString(), period: 'Q2 2024', pages: 48, status: 'ready', format: 'PDF', size: '3.4 MB', starred: true },
  { id: 'r2', type: 'valuation', name: 'Patent Valuation Summary — July 2024', generated: new Date(Date.now() - 2 * 86400000).toISOString(), period: 'July 2024', pages: 22, status: 'ready', format: 'PDF', size: '1.8 MB', starred: false },
  { id: 'r3', type: 'commercialization', name: 'Commercialization Funnel — H1 2024', generated: new Date(Date.now() - 5 * 86400000).toISOString(), period: 'H1 2024', pages: 34, status: 'ready', format: 'PDF', size: '2.6 MB', starred: true },
  { id: 'r4', type: 'buyer-match', name: 'Buyer Match Report — Li-S Battery', generated: new Date(Date.now() - 7 * 86400000).toISOString(), period: 'Jul 2024', pages: 18, status: 'ready', format: 'PDF', size: '1.2 MB', starred: false },
  { id: 'r5', type: 'royalty', name: 'Royalty Report — Q1 2024', generated: new Date(Date.now() - 90 * 86400000).toISOString(), period: 'Q1 2024', pages: 14, status: 'ready', format: 'Excel', size: '0.9 MB', starred: false },
  { id: 'r6', type: 'deal-summary', name: 'Active Deal Summary — July 2024', generated: new Date().toISOString(), period: 'Jul 2024', pages: 0, status: 'generating', format: 'PDF', size: '—', starred: false },
];

const FORMAT_OPTS = ['PDF', 'Excel', 'CSV', 'JSON'];
const PERIOD_OPTS = ['Current Month', 'Last Quarter', 'H1 2024', 'Full Year 2024', 'Custom Range'];

const TYPE_META: Record<string, { color: string; bg: string }> = {
  'ai-portfolio': { color: 'text-accent', bg: 'bg-accent/10' },
  'valuation': { color: 'text-success', bg: 'bg-success/10' },
  'commercialization': { color: 'text-warning', bg: 'bg-warning/10' },
  'buyer-match': { color: 'text-purple-600', bg: 'bg-purple-50' },
  'royalty': { color: 'text-orange-600', bg: 'bg-orange-50' },
  'deal-summary': { color: 'text-navy-700', bg: 'bg-navy-100' },
};

export const ReportsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(REPORTS);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [format, setFormat] = useState('PDF');
  const [period, setPeriod] = useState('Last Quarter');
  const [generating, setGenerating] = useState(false);
  const [starFilter, setStarFilter] = useState(false);

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q)) &&
      (!selectedType || r.type === selectedType) &&
      (!starFilter || r.starred);
  });

  const toggleStar = (id: string) => {
    setReports(rs => rs.map(r => r.id === id ? { ...r, starred: !r.starred } : r));
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    setGenerating(true);
    await new Promise(res => setTimeout(res, 2500));
    const newReport: ReportRecord = {
      id: `r-${Date.now()}`,
      type: selectedType,
      name: `${REPORT_TYPES.find(t => t.id === selectedType)?.label} — ${period}`,
      generated: new Date().toISOString(),
      period,
      pages: Math.floor(Math.random() * 30 + 10),
      status: 'ready',
      format: format as 'PDF' | 'Excel' | 'CSV',
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      starred: false,
    };
    setReports(rs => [newReport, ...rs]);
    setGenerating(false);
  };

  const handleDownload = (r: ReportRecord) => {
    const blob = new Blob([`Report: ${r.name}\nPeriod: ${r.period}\nGenerated on: ${new Date(r.generated).toLocaleString()}\n\nThis is a securely generated IP MatchMaking report.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreview = () => window.print();
  const handleShare = () => alert('Report secure link copied to clipboard!');
  const handleDelete = (id: string) => setReports(rs => rs.filter(r => r.id !== id));


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reports & Exports</h1>
          <p className="text-text-muted text-sm mt-1">Generate AI-powered PDF reports, export data, and download analytics</p>
        </div>
        <button className="btn-secondary text-xs gap-1"><RefreshCw size={13} /> Auto-Reports On</button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Report generator */}
        <div className="space-y-4">
          <div className="card">
            <SectionHeader title="Generate New Report" subtitle="AI-powered in 30 seconds" />
            <div className="mt-4 space-y-3">
              {/* Report type selector */}
              <div>
                <label className="label">Report Type</label>
                <div className="space-y-2 mt-1">
                  {REPORT_TYPES.map(rt => (
                    <button key={rt.id} onClick={() => setSelectedType(rt.id)}
                      className={cn('w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                        selectedType === rt.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-navy-50')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', rt.bg)}>
                        <rt.icon size={14} className={rt.color} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-text-primary">{rt.label}</div>
                        <div className="text-[10px] text-text-muted">{rt.desc}</div>
                      </div>
                      {selectedType === rt.id && <CheckCircle size={14} className="text-accent ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period & format */}
              <div>
                <label className="label">Time Period</label>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm">
                  {PERIOD_OPTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Format</label>
                <div className="flex gap-2">
                  {FORMAT_OPTS.map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={cn('flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all',
                        format === f ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-text-muted border-border hover:border-navy-300')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!selectedType || generating}
                className="btn-primary w-full justify-center gap-2 mt-2 disabled:opacity-50">
                {generating ? (
                  <><RefreshCw size={14} className="animate-spin" /> Generating Report...</>
                ) : (
                  <><Brain size={14} /> Generate Report</>
                )}
              </button>

              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {['Fetching patent data', 'Running AI analysis', 'Generating visualizations', 'Compiling PDF'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 text-xs text-text-muted">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.6 }}>
                        <CheckCircle size={11} className="text-success" />
                      </motion.div>
                      {step}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Scheduled reports */}
          <div className="card">
            <SectionHeader title="Scheduled Auto-Reports" />
            <div className="space-y-3 mt-3">
              {[
                { name: 'Monthly Portfolio Report', freq: 'Every 1st of month', next: 'Aug 1, 2024' },
                { name: 'Quarterly Royalty Report', freq: 'Every quarter', next: 'Oct 1, 2024' },
                { name: 'Weekly Deal Summary', freq: 'Every Monday', next: 'Jul 15, 2024' },
              ].map(s => (
                <div key={s.name} className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-text-primary">{s.name}</div>
                    <div className="text-[10px] text-text-muted">{s.freq} · Next: {s.next}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-success mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report library */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search + filter bar */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="input pl-8 text-sm" />
            </div>
            <button onClick={() => setStarFilter(!starFilter)}
              className={cn('btn-secondary text-xs gap-1', starFilter && 'border-warning text-warning')}>
              <Star size={12} className={starFilter ? 'fill-warning text-warning' : ''} /> Starred
            </button>
            <button onClick={() => setSelectedType(null)} className="btn-secondary text-xs">All Types</button>
          </div>

          {/* Report grid */}
          <div className="space-y-3">
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card hover:shadow-card-hover transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', TYPE_META[r.type]?.bg || 'bg-navy-100')}>
                    <FileText size={20} className={TYPE_META[r.type]?.color || 'text-navy-600'} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary line-clamp-1">{r.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(r.generated)}</span>
                          <span>{r.period}</span>
                          {r.pages > 0 && <span>{r.pages} pages</span>}
                          <span className="badge badge-neutral">{r.format}</span>
                          <span>{r.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleStar(r.id)} className="btn-ghost p-1.5 text-text-muted hover:text-warning">
                          <Star size={13} className={r.starred ? 'fill-warning text-warning' : ''} />
                        </button>
                        {r.status === 'generating' ? (
                          <span className="badge badge-warning flex items-center gap-1"><RefreshCw size={9} className="animate-spin" /> Generating</span>
                        ) : (
                          <span className="badge badge-success">Ready</span>
                        )}
                      </div>
                    </div>

                    {r.status === 'ready' && (
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDownload(r)} className="btn-primary text-xs gap-1"><Download size={12} /> Download</button>
                        <button onClick={handlePreview} className="btn-secondary text-xs gap-1"><Eye size={12} /> Preview</button>
                        <button onClick={handleShare} className="btn-ghost text-xs gap-1"><Share2 size={12} /> Share</button>
                        <button onClick={() => handleDelete(r.id)} className="btn-ghost text-xs gap-1 text-danger ml-auto"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card text-center py-16">
              <FileText size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">No reports found matching your filters</p>
              <button onClick={() => { setSearch(''); setSelectedType(null); setStarFilter(false); }} className="btn-ghost text-xs mt-2">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
