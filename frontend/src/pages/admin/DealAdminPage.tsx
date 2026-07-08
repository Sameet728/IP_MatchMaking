import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, AlertTriangle, Eye, DollarSign } from 'lucide-react';
import { MOCK_DEALS } from '../../data/mockData';
import { cn, formatCurrency } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

export const DealAdminPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredDeals = MOCK_DEALS.filter(d => 
    !search || d.patentTitle.toLowerCase().includes(search.toLowerCase()) || d.licenseeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Handshake size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Deal Administration</h1>
          </div>
          <p className="text-text-muted text-sm">Monitor all platform negotiations, agreements, and dispute resolutions</p>
        </div>
      </motion.div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionHeader title="Global Deal Pipeline" subtitle={`${filteredDeals.length} active records`} />
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..." className="input pl-8 text-sm w-56" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patent Subject</th>
                <th>Parties Involved</th>
                <th>Type</th>
                <th>Status</th>
                <th>Value (Est)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(deal => (
                <tr key={deal.id}>
                  <td className="max-w-[200px]">
                    <div className="font-semibold text-xs text-text-primary line-clamp-1">{deal.patentTitle}</div>
                  </td>
                  <td>
                    <div className="text-[11px] font-medium text-text-primary">Lessor: <span className="text-text-muted font-normal">{deal.licensorName}</span></div>
                    <div className="text-[11px] font-medium text-text-primary mt-0.5">Lessee: <span className="text-text-muted font-normal">{deal.licenseeName}</span></div>
                  </td>
                  <td className="text-xs text-text-muted">{deal.licenseType}</td>
                  <td>
                    <span className={cn('badge', deal.status === 'Active' ? 'badge-success' : deal.status === 'Negotiating' ? 'badge-warning' : 'badge-neutral')}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="text-xs font-bold">
                    <div className="flex items-center gap-1"><DollarSign size={11} className="text-success" /> {formatCurrency(deal.upfrontFee)}</div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-text-muted hover:bg-navy-50 rounded transition-colors" title="Audit Trail">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-warning hover:bg-warning/10 rounded transition-colors" title="Flag for Review">
                        <AlertTriangle size={14} />
                      </button>
                    </div>
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
