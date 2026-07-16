import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Search, Filter, SlidersHorizontal, Grid3X3,
  List, Eye, Brain, Star, StarOff, ChevronDown, Download,
  AlertCircle, CheckCircle, Clock, X, ArrowUpDown, Plus
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import type { Patent } from '../../types';
import { cn, formatCurrency, formatDate, getStatusBadgeClass } from '../../lib/utils';
import { StatCard, SectionHeader, ProgressBar, Badge } from '../../components/ui/StatCard';
import { motion as m } from 'framer-motion';
import { Pagination } from '../../components/ui/Pagination';

const STATUS_OPTIONS = ['All', 'Granted', 'Pending', 'Filed', 'Licensed', 'Abandoned', 'Expired'];
const DOMAIN_OPTIONS = ['All', 'Artificial Intelligence', 'Biotechnology', 'Clean Technology', 'Materials Science', 'Semiconductor', 'Healthcare AI', 'Energy Storage', 'Cybersecurity', 'Robotics'];
const TRL_OPTIONS = ['All', '1-3 (Early)', '4-6 (Mid)', '7-9 (Advanced)'];

const TRL_LABEL_MAP: Record<string, [number, number]> = {
  '1-3 (Early)': [1, 3], '4-6 (Mid)': [4, 6], '7-9 (Advanced)': [7, 9],
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Granted: <CheckCircle size={11} className="text-success" />,
  Licensed: <CheckCircle size={11} className="text-accent" />,
  Pending: <Clock size={11} className="text-warning" />,
  Filed: <Clock size={11} className="text-text-muted" />,
  Abandoned: <X size={11} className="text-danger" />,
  Expired: <AlertCircle size={11} className="text-danger" />,
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const card = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export const PatentPortfolioPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [domain, setDomain] = useState('All');
  const [trl, setTrl] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [sort, setSort] = useState<'date' | 'score' | 'views' | 'price'>('date');
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const STATUS_MAP: Record<string, string> = {
    'Granted': 'GRANTED',
    'Pending': 'PENDING',
    'Filed': 'FILED',
    'Licensed': 'LICENSED',
    'Abandoned': 'ABANDONED',
    'Expired': 'EXPIRED'
  };

  const DOMAIN_MAP: Record<string, string> = {
    'Artificial Intelligence': 'AI_ML',
    'Biotechnology': 'BIOTECH',
    'Clean Technology': 'CLEAN_TECH',
    'Materials Science': 'MATERIALS',
    'Semiconductor': 'SEMICONDUCTOR',
    'Healthcare AI': 'HEALTHCARE',
    'Energy Storage': 'ENERGY',
    'Cybersecurity': 'IT_SOFTWARE',
    'Robotics': 'OTHER'
  };

  const getBackendStatus = (frontStatus: string) => STATUS_MAP[frontStatus];
  const getBackendDomain = (frontDomain: string) => DOMAIN_MAP[frontDomain];

  const getBackendSort = (frontSort: string) => {
    if (frontSort === 'views') return { sortBy: 'viewCount', sortOrder: 'desc' };
    if (frontSort === 'price') return { sortBy: 'askingPrice', sortOrder: 'desc' };
    return { sortBy: 'createdAt', sortOrder: 'desc' };
  };

  const backendStatus = getBackendStatus(status);
  const backendDomain = getBackendDomain(domain);
  const { sortBy, sortOrder } = getBackendSort(sort);

  let queryParams = `/patents?page=${page}&limit=20&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  if (search) queryParams += `&search=${encodeURIComponent(search)}`;
  if (backendStatus) queryParams += `&status=${backendStatus}`;
  if (backendDomain) queryParams += `&domain=${backendDomain}`;

  const { data: fetchedPatents, pagination, loading } = useFetch<Patent[]>(queryParams, [page, search, status, domain, sort]);
  const patents = fetchedPatents || [];

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    return patents.filter(p => {
      const trlRange = TRL_LABEL_MAP[trl];
      const matchTrl = !trlRange || (p.trl >= trlRange[0] && p.trl <= trlRange[1]);
      return matchTrl;
    });
  }, [patents, trl]);

  const stats = useMemo(() => ({
    total: pagination?.total || patents.length,
    granted: patents.filter(p => p.status === 'Granted' || p.status === 'GRANTED').length,
    licensed: patents.filter(p => p.status === 'Licensed' || p.status === 'LICENSED').length,
    pending: patents.filter(p => p.status === 'Pending' || p.status === 'PENDING' || p.status === 'Filed' || p.status === 'FILED').length,
    avgScore: 82, // Hardcoded dashboard average
  }), [patents, pagination]);

  const toggleStar = (id: string) => setStarred(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const exportCSV = () => {
    const headers = [
      'Patent Number', 'Title', 'Status', 'Domain', 'Country',
      'Filing Date', 'Grant Date', 'Expiry Date', 'TRL',
      'Asking Price (USD)', 'Royalty Rate (%)', 'Is Listed',
      'Inventor', 'Organization', 'Keywords', 'IPC Codes', 'Created At'
    ];

    const rows = filtered.map(p => [
      p.patentNumber || '',
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.status || '',
      p.domain || p.technologyDomain || '',
      p.country || '',
      p.filingDate ? new Date(p.filingDate).toLocaleDateString() : '',
      p.grantDate ? new Date(p.grantDate).toLocaleDateString() : '',
      p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '',
      p.trl || '',
      p.askingPrice ?? p.listingPrice ?? '',
      p.royaltyRate || '',
      p.isListed ? 'Yes' : 'No',
      p.inventor?.name || '',
      p.organization?.name || '',
      `"${(p.keywords || []).join(', ')}"`,
      `"${(p.ipcCodes || []).join(', ')}"`,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patents_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Patent Portfolio</h1>
          <p className="text-text-muted text-sm mt-1">{filtered.length} patents · Showing {Math.min(filtered.length, 50)} results</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-secondary text-xs gap-1 disabled:opacity-40"><Download size={13} /> Export CSV ({filtered.length})</button>
          <Link to="/patents/bulk-upload" className="btn-secondary text-xs gap-1"><Upload size={13} /> Bulk Import CSV</Link>
          <Link to="/patents/upload" className="btn-primary text-xs"><Plus size={13} /> Add Patent</Link>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Patents', value: stats.total, icon: <FileText size={14} /> },
          { label: 'Granted', value: stats.granted, icon: <CheckCircle size={14} /> },
          { label: 'Licensed', value: stats.licensed, icon: <Brain size={14} /> },
          { label: 'Avg AI Score', value: `${stats.avgScore}/100`, icon: <Star size={14} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => handleFilterChange(setSearch, e.target.value)}
              placeholder="Search patents, numbers, assignees..."
              className="input pl-9 text-sm" />
          </div>

          {/* Status */}
          <select value={status} onChange={e => handleFilterChange(setStatus, e.target.value)} className="input text-sm w-36">
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          {/* Domain */}
          <select value={domain} onChange={e => handleFilterChange(setDomain, e.target.value)} className="input text-sm w-44">
            {DOMAIN_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          {/* TRL */}
          <select value={trl} onChange={e => handleFilterChange(setTrl, e.target.value)} className="input text-sm w-36">
            {TRL_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5 ml-auto">
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="input text-sm w-32">
              <option value="date">Newest</option>
              <option value="score">AI Score</option>
              <option value="views">Most Viewed</option>
              <option value="price">Price</option>
            </select>
            {/* View toggle */}
            <div className="flex border border-border rounded-md overflow-hidden">
              <button onClick={() => setView('list')} className={cn('p-2 transition-colors', view === 'list' ? 'bg-navy-900 text-white' : 'bg-white text-text-muted hover:bg-navy-50')}><List size={14} /></button>
              <button onClick={() => setView('grid')} className={cn('p-2 transition-colors', view === 'grid' ? 'bg-navy-900 text-white' : 'bg-white text-text-muted hover:bg-navy-50')}><Grid3X3 size={14} /></button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(status !== 'All' || domain !== 'All' || trl !== 'All' || search) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
            {search && <span className="badge badge-accent gap-1">{search} <button onClick={() => setSearch('')}><X size={10} /></button></span>}
            {status !== 'All' && <span className="badge badge-neutral gap-1">{status} <button onClick={() => setStatus('All')}><X size={10} /></button></span>}
            {domain !== 'All' && <span className="badge badge-neutral gap-1">{domain} <button onClick={() => setDomain('All')}><X size={10} /></button></span>}
            {trl !== 'All' && <span className="badge badge-neutral gap-1">TRL: {trl} <button onClick={() => setTrl('All')}><X size={10} /></button></span>}
            <button onClick={() => { setSearch(''); setStatus('All'); setDomain('All'); setTrl('All'); }} className="text-xs text-danger hover:underline">Clear all</button>
          </div>
        )}
      </motion.div>

      {/* Patent List */}
      {view === 'list' ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th>Patent</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>TRL</th>
                  <th>AI Score</th>
                  <th>Views</th>
                  <th>Listing Price</th>
                  <th>Filed</th>
                  <th></th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
                {filtered.map(p => {
                  const displayStatus = p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase();
                  return (
                    <motion.tr key={p.id} variants={card} className="group">
                      <td className="text-center">
                        <button onClick={() => toggleStar(p.id)} className="text-text-muted hover:text-warning transition-colors">
                          {starred.has(p.id) ? <Star size={13} className="fill-warning text-warning" /> : <StarOff size={13} />}
                        </button>
                      </td>
                      <td className="max-w-[280px]">
                        <div className="font-semibold text-xs text-text-primary line-clamp-2 leading-tight">{p.title}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{p.patentNumber} · {typeof p.assignee === 'string' ? p.assignee : (p.assignee as any)?.name || p.organization?.name || 'Unknown'}</div>
                      </td>
                      <td className="text-xs text-text-muted whitespace-nowrap">{p.technologyDomain || p.domain}</td>
                      <td>
                        <span className={cn('badge flex items-center gap-1', getStatusBadgeClass(displayStatus))}>
                          {STATUS_ICON[displayStatus]} {displayStatus}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center',
                            p.trl >= 7 ? 'bg-success/15 text-success' : p.trl >= 4 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger')}>
                            {p.trl}
                          </div>
                          <span className="text-[10px] text-text-muted">{p.commercialReadiness}</span>
                        </div>
                      </td>
                      <td>
                        {p.aiReport ? (
                          <div className="flex items-center gap-1.5">
                            <div className={cn('text-sm font-bold', p.aiReport.overallScore >= 80 ? 'text-success' : p.aiReport.overallScore >= 60 ? 'text-warning' : 'text-danger')}>
                              {p.aiReport.overallScore}
                            </div>
                            <ProgressBar value={p.aiReport.overallScore} className="w-12" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-muted italic">Not analyzed</span>
                        )}
                      </td>
                      <td className="text-xs text-text-muted"><Eye size={11} className="inline mr-1" />{(p.views || 0).toLocaleString()}</td>
                      <td className="text-xs font-semibold">{p.listingPrice ? formatCurrency(p.listingPrice) : <span className="text-text-muted">—</span>}</td>
                      <td className="text-xs text-text-muted whitespace-nowrap">{formatDate(p.filingDate)}</td>
                      <td>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/patents/${p.id}`} className="btn-ghost p-1.5"><Eye size={13} /></Link>
                          <Link to={`/ai-analysis/${p.id}`} className="btn-ghost p-1.5"><Brain size={13} /></Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const displayStatus = p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase();
            return (
              <motion.div key={p.id} variants={card}>
                <div className="card card-hover cursor-pointer group relative">
                  {p.isFeatured && <span className="absolute top-3 right-3 badge badge-accent">Featured</span>}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-accent" />
                    </div>
                    <button onClick={e => { e.preventDefault(); toggleStar(p.id); }} className="text-text-muted hover:text-warning transition-colors">
                      {starred.has(p.id) ? <Star size={14} className="fill-warning text-warning" /> : <StarOff size={14} />}
                    </button>
                  </div>
                  <h3 className="text-xs font-semibold text-text-primary line-clamp-2 mb-1 leading-tight">{p.title}</h3>
                  <p className="text-[11px] text-text-muted mb-3 line-clamp-2">{p.abstract}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={cn('badge', getStatusBadgeClass(displayStatus))}>{displayStatus}</span>
                    <span className="badge badge-neutral">TRL {p.trl}</span>
                    {p.aiReport && (
                      <span className={cn('badge', p.aiReport.overallScore >= 80 ? 'badge-success' : 'badge-warning')}>
                        AI {p.aiReport.overallScore}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-text-muted mb-3">{typeof p.assignee === 'string' ? p.assignee : (p.assignee as any)?.name || p.organization?.name || 'Unknown'} · {p.domain || p.technologyDomain}</div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-bold text-text-primary">{p.listingPrice ? formatCurrency(p.listingPrice) : '—'}</span>
                    <div className="flex gap-1">
                      <Link to={`/patents/${p.id}`} className="btn-secondary text-[11px] px-2 py-1">View</Link>
                      <Link to={`/ai-analysis/${p.id}`} className="btn-primary text-[11px] px-2 py-1">AI Report</Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={20}
          onPageChange={setPage}
          className="mt-6 border border-border rounded-xl"
        />
      )}
    </div>
  );
};
