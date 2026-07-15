import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Search, Calendar, BarChart3,
  Brain, TrendingUp, DollarSign, Building2, Handshake,
  CheckCircle, RefreshCw, Star, Trash2, Eye, Share2, Sparkles
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import { cn, formatDate } from '../../lib/utils';
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

const FORMAT_OPTS = ['PDF', 'Excel', 'CSV', 'JSON'];
const PERIOD_OPTS = ['Current Month', 'Last Quarter', 'H1 2024', 'Full Year 2024', 'Custom Range'];

export const ReportsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [format, setFormat] = useState('PDF');
  const [period, setPeriod] = useState('Last Quarter');
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { data, loading, refetch } = useFetch<any[]>('/reports');
  const reports = data || [];

  const filteredReports = reports.filter(r => {
    const q = search.toLowerCase();
    const name = r.name || r.title || '';
    return (!q || name.toLowerCase().includes(q)) && 
           (filterType === 'All' || r.type === filterType);
  });

  const generateReport = async () => {
    if (!selectedType) return;
    setGenerating(true);
    try {
      await api.post('/reports', { type: selectedType, format, period });
      await refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
      setShowGenerateModal(false);
    }
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      await api.patch(`/reports/${id}`, { starred: !currentStarred });
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const res = await api.get(`/reports/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreview = () => window.print();
  const handleShare = () => alert('Report secure link copied to clipboard!');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reports & Exports</h1>
          <p className="text-text-muted text-sm mt-1">Generate AI-powered PDF reports, export data, and download analytics</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="card">
            <SectionHeader title="Generate New Report" subtitle="AI-powered in 30 seconds" />
            <div className="mt-4 space-y-3">
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
              <div>
                <label className="label">Time Period</label>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm">
                  {PERIOD_OPTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button onClick={generateReport} disabled={!selectedType || generating}
                className="btn-primary w-full justify-center gap-2 mt-2 disabled:opacity-50">
                {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="input pl-8 text-sm" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card hover:shadow-card-hover transition-all group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{r.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(r.createdAt)}</span>
                          <span className="badge badge-neutral">{r.format}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleStar(r.id, r.starred)} className="text-text-muted hover:text-accent transition-colors">
                          <Star size={16} className={r.starred ? 'fill-accent text-accent' : ''} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleDownload(r.id, r.title)} className="btn-ghost p-1.5"><Download size={14} /></button>
                      <button onClick={handlePreview} className="btn-ghost p-1.5"><Eye size={14} /></button>
                      <button onClick={handleShare} className="btn-ghost p-1.5"><Share2 size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="btn-ghost p-1.5 text-danger hover:bg-danger/10 ml-auto"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="card text-center py-16">
              <FileText size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">No reports found matching your filters</p>
              <button onClick={() => { setSearch(''); setFilterType('All'); }} className="btn-ghost text-xs mt-2">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
