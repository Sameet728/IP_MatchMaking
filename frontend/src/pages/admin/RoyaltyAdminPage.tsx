import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useApi';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export const RoyaltyAdminPage: React.FC = () => {
  const { data: fetchedRoyalties, loading } = useFetch<any[]>('/royalties');
  const royalties = fetchedRoyalties || [];

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
        <SectionHeader title="Global Royalty Ledger" subtitle={`${royalties.length} transactions`} />
        
        <div className="overflow-x-auto mt-4">
          {loading ? <p className="text-text-muted text-sm py-4">Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal / Patent</th>
                <th>Licensee (Payer)</th>
                <th>Amount</th>
                <th>Platform Fee (5%)</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {royalties.map((r: any) => (
                <tr key={r.id}>
                  <td className="text-xs font-semibold">{r.deal?.patents?.[0]?.title || r.dealId || '—'}</td>
                  <td className="text-xs text-text-muted">{r.deal?.buyer?.name || '—'}</td>
                  <td className="text-sm font-bold">{formatCurrency(r.amount)}</td>
                  <td className="text-xs text-danger font-medium">-{formatCurrency(r.amount * 0.05)}</td>
                  <td className="text-sm font-bold text-success">{formatCurrency(r.amount * 0.95)}</td>
                  <td>
                    <span className={cn('badge', r.status === 'PAID' ? 'badge-success' : r.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning')}>{r.status}</span>
                  </td>
                  <td className="text-xs text-text-muted">{r.dueDate ? formatDate(r.dueDate) : '—'}</td>
                </tr>
              ))}
              {royalties.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-text-muted text-sm py-8">No royalty records found.</td></tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};
