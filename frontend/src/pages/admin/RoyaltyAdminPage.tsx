import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Search, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';
import { MOCK_ROYALTIES } from '../../data/mockData';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export const RoyaltyAdminPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <DollarSign size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Royalty Administration</h1>
          </div>
          <p className="text-text-muted text-sm">Global overview of all royalty distributions, platform fees, and payouts</p>
        </div>
        <button className="btn-secondary text-xs gap-1"><Download size={13} /> Export Ledger</button>
      </motion.div>

      <div className="card">
        <SectionHeader title="Global Royalty Ledger" subtitle={`${MOCK_ROYALTIES.length} transactions`} />
        
        <div className="overflow-x-auto mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Licensee (Payer)</th>
                <th>Amount</th>
                <th>Platform Fee (5%)</th>
                <th>Net Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROYALTIES.map(r => (
                <tr key={r.id}>
                  <td className="text-xs font-semibold">{r.patentTitle}</td>
                  <td className="text-xs text-text-muted">{r.licenseeName}</td>
                  <td className="text-sm font-bold">{formatCurrency(r.amount)}</td>
                  <td className="text-xs text-danger font-medium">-{formatCurrency(r.amount * 0.05)}</td>
                  <td className="text-sm font-bold text-success">{formatCurrency(r.amount * 0.95)}</td>
                  <td>
                    <span className={cn('badge', r.status === 'Received' ? 'badge-success' : 'badge-warning')}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
