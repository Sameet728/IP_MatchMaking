import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake, DollarSign, Clock, CheckCircle,
  Plus, Search, ChevronRight, Brain,
  Building2, Calendar, Download
} from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import type { Deal } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { StatCard, SectionHeader, ProgressBar } from '../../components/ui/StatCard';

const STATUS_STEPS: Record<string, string[]> = {
  'NDA Signed': ['NDA Signed'],
  'Term Sheet': ['NDA Signed', 'Term Sheet'],
  'Due Diligence': ['NDA Signed', 'Term Sheet', 'Due Diligence'],
  'Negotiating': ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating'],
  'Active': ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating', 'Active'],
  'Signed': ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating', 'Active', 'Signed'],
  'Completed': ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating', 'Active', 'Signed', 'Completed'],
};
const ALL_STEPS = ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating', 'Active', 'Signed', 'Completed'];

const COLOR_MAP: Record<string, string> = {
  'Active': 'badge-success', 'Negotiating': 'badge-warning',
  'Due Diligence': 'badge-accent', 'Term Sheet': 'badge-neutral',
  'NDA Signed': 'badge-neutral', 'Completed': 'badge-danger', 'Signed': 'badge-success',
};

export const DealsPage: React.FC = () => {
  const { data: fetchedDeals, loading } = useFetch<Deal[]>('/deals');
  const deals = fetchedDeals || [];
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  React.useEffect(() => {
    if (deals.length > 0 && !selectedDeal) {
      setSelectedDeal(deals[0]);
    }
  }, [deals, selectedDeal]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deals.filter(d => {
      return (statusFilter === 'All' || d.status === statusFilter) &&
        (!q || (d.patents?.[0]?.patent?.title || '').toLowerCase().includes(q) || (d.company?.name || '').toLowerCase().includes(q));
    });
  }, [deals, search, statusFilter]);

  const totalValue = deals.reduce((s, d) => s + (d.upfrontFee || 0), 0);
  const activeCount = deals.filter(d => d.status === 'Active' || d.status === 'Negotiating').length;

  if (loading) return <div className="p-6">Loading deals...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Deals & Negotiations</h1>
          <p className="text-text-muted text-sm mt-1">Track all licensing deals, negotiations, and agreements</p>
        </div>
        <button className="btn-primary text-xs gap-1"><Plus size={13} /> New Deal</button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Deals', value: deals.length, icon: <Handshake size={14} />, change: 12, trend: 'up' as const },
          { label: 'Active', value: activeCount, icon: <Clock size={14} />, change: 8, trend: 'up' as const },
          { label: 'Deal Value (Total)', value: totalValue, isCurrency: true, icon: <DollarSign size={14} />, change: 34, trend: 'up' as const },
          { label: 'Avg. Deal Size', value: deals.length > 0 ? Math.round(totalValue / deals.length) : 0, isCurrency: true, icon: <CheckCircle size={14} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="vs last quarter" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Deal list */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..." className="input pl-8 text-sm" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-36">
              {['All', ...ALL_STEPS].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Deal cards */}
          <div className="space-y-2">
            {filtered.map(deal => (
              <motion.button key={deal.id} onClick={() => setSelectedDeal(deal)} layout
                className={cn('w-full text-left p-4 rounded-xl border transition-all',
                  selectedDeal?.id === deal.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-white hover:bg-navy-50')}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs font-semibold text-text-primary line-clamp-2 flex-1">{deal.patents?.[0]?.patent?.title || 'Patent Deal'}</div>
                  <span className={cn('badge shrink-0', COLOR_MAP[deal.status] || 'badge-neutral')}>{deal.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1"><Building2 size={10} />{deal.company?.name}</span>
                  <span>{deal.type}</span>
                  <span className="ml-auto font-semibold text-text-primary">{formatCurrency(deal.upfrontFee)}</span>
                </div>
                <div className="mt-2.5">
                  <ProgressBar value={STATUS_STEPS[deal.status]?.length ?? 0} max={ALL_STEPS.length}
                    color={deal.status === 'Active' || deal.status === 'Signed' ? '#10B981' : deal.status === 'Negotiating' ? '#F59E0B' : '#2563EB'} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Deal detail */}
        <div className="lg:col-span-3">
          {selectedDeal && (
            <motion.div key={selectedDeal.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Deal header */}
              <div className="card">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-text-primary leading-tight mb-1">{selectedDeal.patents?.[0]?.patent?.title || 'Patent Deal'}</h2>
                    <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Building2 size={11} />{selectedDeal.company?.name}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />Started {selectedDeal.createdAt ? formatDate(selectedDeal.createdAt) : 'N/A'}</span>
                    </div>
                  </div>
                  <span className={cn('badge', COLOR_MAP[selectedDeal.status] || 'badge-neutral')}>{selectedDeal.status}</span>
                </div>

                {/* Progress pipeline */}
                <div className="relative">
                  <div className="flex items-center">
                    {ALL_STEPS.map((step, i) => {
                      const done = (STATUS_STEPS[selectedDeal.status]?.length ?? 0) > i;
                      const active = STATUS_STEPS[selectedDeal.status]?.[STATUS_STEPS[selectedDeal.status].length - 1] === step;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center">
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10',
                              done ? 'bg-success text-white' : active ? 'bg-accent text-white' : 'bg-navy-100 text-text-muted')}>
                              {done ? <CheckCircle size={12} /> : i + 1}
                            </div>
                            <span className={cn('text-[9px] mt-1 text-center leading-tight max-w-14', done ? 'text-success font-medium' : 'text-text-muted')}>{step}</span>
                          </div>
                          {i < ALL_STEPS.length - 1 && (
                            <div className={cn('flex-1 h-0.5 -mt-4', done ? 'bg-success' : 'bg-navy-200')} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Deal financials */}
              <div className="card">
                <SectionHeader title="Deal Financials" />
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  {[
                    { label: 'License Type', value: selectedDeal.type },
                    { label: 'License Territory', value: selectedDeal.territory },
                    { label: 'Upfront Fee', value: formatCurrency(selectedDeal.upfrontFee), highlight: true },
                    { label: 'Royalty Rate', value: `${selectedDeal.royaltyRate}%` },
                    { label: 'Annual Minimum', value: selectedDeal.minimumRoyalty !== undefined ? formatCurrency(selectedDeal.minimumRoyalty) : 'None' },
                    { label: 'Duration', value: `${selectedDeal.duration} years` },
                    { label: 'Sublicensing', value: 'Permitted' },
                    { label: 'Start Date', value: selectedDeal.createdAt ? formatDate(selectedDeal.createdAt) : 'N/A' },
                  ].map(item => (
                    <div key={item.label} className={cn('p-3 rounded-lg', item.highlight ? 'bg-success/5 border border-success/20' : 'bg-navy-50 border border-border')}>
                      <div className="text-[11px] text-text-muted font-medium">{item.label}</div>
                      <div className={cn('text-sm font-bold mt-0.5', item.highlight ? 'text-success' : 'text-text-primary')}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              {selectedDeal.milestones && selectedDeal.milestones.length > 0 && (
                <div className="card">
                  <SectionHeader title="Deal Milestones" />
                  <div className="space-y-3 mt-3">
                    {selectedDeal.milestones.map((m, i) => (
                      <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg border', m.status === 'Met' ? 'bg-success/5 border-success/20' : 'bg-navy-50 border-border')}>
                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          m.status === 'Met' ? 'bg-success text-white' : 'bg-navy-200 text-text-muted')}>
                          {m.status === 'Met' ? <CheckCircle size={11} /> : <Clock size={11} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-text-primary">{m.title}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{formatDate(m.dueDate)}</div>
                        </div>
                        <div className="text-xs font-bold text-success shrink-0">{m.amount ? formatCurrency(m.amount) : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button className="btn-secondary text-xs gap-1"><Download size={13} /> Download Agreement</button>
                <button className="btn-secondary text-xs gap-1"><Brain size={13} /> AI Analysis</button>
                <button className="btn-primary text-xs gap-1"><ChevronRight size={13} /> Advance Stage</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
