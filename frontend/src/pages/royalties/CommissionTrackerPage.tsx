import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Percent, Download } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_COMMISSIONS = [
  { id: 'COM-01', deal: 'Quantum Encryption Deal', amount: '$150,000', status: 'Pending Payout', rate: '3%' },
  { id: 'COM-02', deal: 'Solid-State Battery License', amount: '$45,000', status: 'Paid', rate: '2.5%' },
];

export const CommissionTrackerPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Percent size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Commission Tracker</h1>
          </div>
          <p className="text-text-muted text-sm">Monitor broker fees, match-making splits, and payout schedules</p>
        </div>
        <button className="btn-secondary text-xs gap-1"><Download size={13} /> Statement</button>
      </motion.div>

      <div className="card">
        <SectionHeader title="Earned Commissions" />
        <div className="mt-4 space-y-3">
          {MOCK_COMMISSIONS.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">{item.deal}</h3>
                <div className="text-xs text-text-muted mt-0.5">Brokerage Rate: {item.rate}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-success">{item.amount}</div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${item.status === 'Paid' ? 'text-success' : 'text-warning'}`}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
