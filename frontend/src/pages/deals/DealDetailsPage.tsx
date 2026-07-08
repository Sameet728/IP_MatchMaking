import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Download, Building2, Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { MOCK_DEALS } from '../../data/mockData';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

const STATUS_STEPS = ['NDA Signed', 'Term Sheet', 'Due Diligence', 'Negotiating', 'Active', 'Signed', 'Completed'];

export const DealDetailsPage: React.FC = () => {
  const { id } = useParams();
  const deal = MOCK_DEALS.find(d => d.id === id);

  if (!deal) return <Navigate to="/deals" replace />;

  const currentStepIndex = STATUS_STEPS.indexOf(deal.status);
  const doneSteps = currentStepIndex >= 0 ? STATUS_STEPS.slice(0, currentStepIndex + 1) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/deals" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Deals
      </Link>
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary leading-tight mb-2">{deal.patentTitle}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-1"><Building2 size={14} /> Lessee: {deal.licenseeName}</span>
                <span className="flex items-center gap-1"><Building2 size={14} /> Lessor: {deal.licensorName}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Started: {deal.startDate ? formatDate(deal.startDate) : 'N/A'}</span>
              </div>
            </div>
            <span className={cn('badge text-sm py-1 px-3', deal.status === 'Active' || deal.status === 'Signed' ? 'badge-success' : 'badge-warning')}>{deal.status}</span>
          </div>

          <div className="relative pt-4 pb-2">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const done = doneSteps.includes(step);
                const active = deal.status === step;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-sm transition-colors',
                        done ? 'bg-success text-white' : active ? 'bg-accent text-white' : 'bg-navy-100 text-text-muted')}>
                        {done ? <CheckCircle size={14} /> : i + 1}
                      </div>
                      <span className={cn('text-[10px] mt-2 text-center leading-tight max-w-[60px]', done ? 'text-success font-semibold' : 'text-text-muted')}>{step}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={cn('flex-1 h-1 -mt-6 transition-colors', done ? 'bg-success' : 'bg-navy-100')} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <SectionHeader title="Deal Financials & Terms" />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'License Type', value: deal.licenseType },
              { label: 'Territory', value: deal.territory.join(', ') || 'Global' },
              { label: 'Upfront Fee', value: formatCurrency(deal.upfrontFee), highlight: true },
              { label: 'Royalty Rate', value: `${deal.royaltyRate}%` },
              { label: 'Duration', value: `${deal.duration} years` },
            ].map(item => (
              <div key={item.label} className={cn('p-4 rounded-xl', item.highlight ? 'bg-success/5 border border-success/20' : 'bg-navy-50 border border-border')}>
                <div className="text-xs text-text-muted font-medium mb-1">{item.label}</div>
                <div className={cn('text-lg font-bold', item.highlight ? 'text-success' : 'text-text-primary')}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {deal.milestones.length > 0 && (
          <div className="card">
            <SectionHeader title="Execution Milestones" />
            <div className="space-y-3 mt-4">
              {deal.milestones.map((m, i) => (
                <div key={i} className={cn('flex items-center gap-4 p-4 rounded-xl border transition-colors', m.status === 'Met' ? 'bg-success/5 border-success/20' : 'bg-navy-50 border-border')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    m.status === 'Met' ? 'bg-success text-white' : 'bg-navy-200 text-text-muted')}>
                    {m.status === 'Met' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-text-primary">{m.title}</div>
                    <div className="text-xs text-text-muted mt-1">Due: {formatDate(m.dueDate)}</div>
                  </div>
                  <div className="text-sm font-bold text-success shrink-0">{m.amount ? formatCurrency(m.amount) : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <button className="btn-secondary gap-2"><Download size={16} /> Download PDF</button>
          <button className="btn-secondary gap-2"><Brain size={16} /> AI Summary</button>
          <button className="btn-primary gap-2">Advance Deal Stage <ChevronRight size={16} /></button>
        </div>
      </motion.div>
    </div>
  );
};
