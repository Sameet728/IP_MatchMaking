import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Brain, Star, Eye, Handshake, Filter,
  SlidersHorizontal, ArrowRight, TrendingUp, Globe, Zap, X, ChevronDown, Grid3X3, List
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import { cn, formatCurrency, getStatusBadgeClass } from '../../lib/utils';
import { StatCard, SectionHeader, ScoreRing, ProgressBar } from '../../components/ui/StatCard';

const CATEGORIES = ['All', 'AI / ML', 'Biotechnology', 'Clean Technology', 'Materials Science', 'Semiconductor', 'Healthcare AI', 'Energy Storage', 'Cybersecurity', 'Robotics', 'Quantum Technology'];
const PRICE_RANGES = ['Any Price', 'Under $1M', '$1M–$5M', '$5M–$15M', 'Above $15M'];
const TRL_FILTERS = ['Any TRL', 'Early Stage (1–3)', 'Mid Stage (4–6)', 'Commercial Ready (7–9)'];
const SORT_OPTIONS = ['Newest', 'Highest AI Score', 'Lowest Price', 'Most Viewed', 'Best Match'];

const priceCheck = (price: number | undefined, range: string) => {
  if (range === 'Any Price' || !price) return true;
  if (range === 'Under $1M') return price < 1000000;
  if (range === '$1M–$5M') return price >= 1000000 && price < 5000000;
  if (range === '$5M–$15M') return price >= 5000000 && price < 15000000;
  if (range === 'Above $15M') return price >= 15000000;
  return true;
};

const trlCheck = (trl: number, filter: string) => {
  if (filter === 'Any TRL') return true;
  if (filter === 'Early Stage (1–3)') return trl <= 3;
  if (filter === 'Mid Stage (4–6)') return trl >= 4 && trl <= 6;
  if (filter === 'Commercial Ready (7–9)') return trl >= 7;
  return true;
};

const FEATURED_TAGS = ['Featured', 'High Demand', 'AI-Recommended', 'Government Backed', 'Export Ready'];

export const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('Any Price');
  const [trlFilter, setTrlFilter] = useState('Any TRL');
  const [sort, setSort] = useState('Highest AI Score');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: response, loading } = useFetch<any>('/patents?isListed=true');
  const listedPatents = response || [];

  const filtered = useMemo(() => {
    return listedPatents
      .filter((p: any) => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.title.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || (p.inventor?.organization?.name || p.inventor?.name || '').toLowerCase().includes(q) || p.keywords.some((k: string) => k.toLowerCase().includes(q));
        const matchCat = category === 'All' || p.domain === category;
        const matchPrice = priceCheck(p.askingPrice, priceRange);
        const matchTrl = trlCheck(p.trl, trlFilter);
        return matchSearch && matchCat && matchPrice && matchTrl;
      })
      .sort((a: any, b: any) => {
        if (sort === 'Highest AI Score') return (b.aiReport?.overallScore ?? 0) - (a.aiReport?.overallScore ?? 0);
        if (sort === 'Lowest Price') return (a.askingPrice ?? Infinity) - (b.askingPrice ?? Infinity);
        if (sort === 'Most Viewed') return b.viewCount - a.viewCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [search, category, priceRange, trlFilter, sort, listedPatents]);

  const toggleSave = (id: string) => setSaved(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const featured = filtered.filter((p: any) => p.isFeatured).slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-navy-900 pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">IP Marketplace</h1>
              <p className="text-navy-300 text-sm">Browse {listedPatents.length} licensable patents from leading universities, research labs, and innovators</p>
              <div className="flex gap-4 mt-3">
                {[
                  { label: 'Listed Patents', value: listedPatents.length },
                  { label: 'Avg. AI Score', value: '83/100' },
                  { label: 'Total Value', value: '$148M+' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-white font-bold text-lg">{s.value}</div>
                    <div className="text-navy-400 text-[11px]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/ai-match" className="btn-primary text-sm gap-2 bg-white text-navy-900 hover:bg-navy-100">
              <Brain size={16} /> AI Match Me
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Featured patent tags */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FEATURED_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeTag === tag ? 'bg-accent text-white border-accent' : 'bg-white border-border text-text-muted hover:border-accent hover:text-accent')}>
            {tag}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patents, domains, assignees, keywords..."
              className="input pl-9 text-sm" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input text-sm w-44">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="input text-sm w-36">
            {PRICE_RANGES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={trlFilter} onChange={e => setTrlFilter(e.target.value)} className="input text-sm w-44">
            {TRL_FILTERS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input text-sm w-40">
            {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={() => setView('grid')} className={cn('p-2', view === 'grid' ? 'bg-navy-900 text-white' : 'bg-white text-text-muted')}><Grid3X3 size={14} /></button>
            <button onClick={() => setView('list')} className={cn('p-2', view === 'list' ? 'bg-navy-900 text-white' : 'bg-white text-text-muted')}><List size={14} /></button>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">{filtered.length} patents found</p>
      </div>

      {/* Featured patents (if no search) */}
      {!search && !activeTag && featured.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <SectionHeader title="Featured Opportunities" subtitle="Curated high-value patents" />
          <div className="grid sm:grid-cols-3 gap-4 mt-3">
            {featured.map((p: any) => (
              <div key={p.id} className="relative card border-2 border-accent/20 bg-gradient-to-b from-accent/3 to-transparent overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-blue-400" />
                <div className="flex items-start justify-between mb-3">
                  <span className="badge badge-accent">⭐ Featured</span>
                  <button onClick={() => toggleSave(p.id)} className="text-text-muted hover:text-warning transition-colors">
                    <Star size={15} className={saved.has(p.id) ? 'fill-warning text-warning' : ''} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-text-primary leading-tight mb-2 line-clamp-2">{p.title}</h3>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{p.abstract}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.keywords.slice(0, 3).map((k: string) => <span key={k} className="badge badge-neutral">{k}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-success">{p.listingPrice ? formatCurrency(p.listingPrice) : 'Negotiable'}</div>
                    <div className="text-[11px] text-text-muted">{p.inventor?.organization?.name || p.inventor?.name}</div>
                  </div>
                  {p.aiReport && <ScoreRing score={p.aiReport.overallScore} size={50} />}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Link to={`/patents/${p.id}`} className="btn-secondary text-xs flex-1 justify-center">Details</Link>
                  <Link to={`/ai-analysis/${p.id}`} className="btn-primary text-xs flex-1 justify-center">AI Report</Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main listing */}
      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="card card-hover h-full flex flex-col cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-wrap gap-1">
                    <span className={cn('badge', getStatusBadgeClass(p.status))}>{p.status}</span>
                    {p.isFeatured && <span className="badge badge-accent">Featured</span>}
                  </div>
                  <button onClick={() => toggleSave(p.id)} className="text-text-muted hover:text-warning transition-colors ml-1">
                    <Star size={13} className={saved.has(p.id) ? 'fill-warning text-warning' : ''} />
                  </button>
                </div>

                <h3 className="text-xs font-bold text-text-primary line-clamp-2 leading-tight mb-1 flex-1">{p.title}</h3>
                <div className="text-[11px] text-text-muted mb-2">{p.assignee} · {p.country}</div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="badge badge-neutral">TRL {p.trl}</span>
                  <span className="badge badge-neutral">{p.domain}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-black text-text-primary">{p.askingPrice ? formatCurrency(p.askingPrice) : <span className="text-text-muted text-xs italic">Price on request</span>}</div>
                    <div className="text-[11px] text-text-muted flex items-center gap-1"><Eye size={10} /> {(p.viewCount || 0).toLocaleString()} views</div>
                  </div>
                  {p.aiReport && (
                    <div className="text-right">
                      <div className={cn('text-lg font-black', p.aiReport.overallScore >= 80 ? 'text-success' : 'text-warning')}>{p.aiReport.overallScore}</div>
                      <div className="text-[10px] text-text-muted">AI Score</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-auto">
                  <Link to={`/patents/${p.id}`} className="btn-ghost text-[11px] flex-1 justify-center py-1.5">View</Link>
                  <Link to={`/ai-analysis/${p.id}`} className="btn-secondary text-[11px] flex-1 justify-center py-1.5">AI</Link>
                  <button className="btn-primary text-[11px] px-2 py-1.5 gap-1"><Handshake size={11} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th></th><th>Patent</th><th>Domain</th><th>Status</th><th>TRL</th><th>AI Score</th><th>Price</th><th>Views</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((p: any, i: number) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="group">
                    <td><button onClick={() => toggleSave(p.id)} className="text-text-muted hover:text-warning"><Star size={13} className={saved.has(p.id) ? 'fill-warning text-warning' : ''} /></button></td>
                    <td className="max-w-[260px]">
                      <div className="font-semibold text-xs text-text-primary line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-text-muted">{p.patentNumber} · {p.inventor?.organization?.name || p.inventor?.name}</div>
                    </td>
                    <td className="text-xs text-text-muted">{p.domain}</td>
                    <td><span className={cn('badge', getStatusBadgeClass(p.status))}>{p.status}</span></td>
                    <td className="text-xs font-bold">{p.trl}</td>
                    <td className={cn('text-sm font-bold', (p.aiReport?.overallScore ?? 0) >= 80 ? 'text-success' : 'text-warning')}>{p.aiReport?.overallScore ?? '—'}</td>
                    <td className="text-xs font-semibold">{p.askingPrice ? formatCurrency(p.askingPrice) : '—'}</td>
                    <td className="text-xs text-text-muted">{(p.viewCount || 0).toLocaleString()}</td>
                    <td><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/patents/${p.id}`} className="btn-ghost text-xs px-2">View</Link>
                      <button className="btn-primary text-xs px-2">Inquire</button>
                    </div></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
