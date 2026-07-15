import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, AlertTriangle, Eye, ShieldAlert, CheckCircle } from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import { cn, formatDate } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

export const PatentAdminPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: fetchedPatents, loading } = useFetch<any[]>('/patents');
  const patents = fetchedPatents || [];

  const filteredPatents = patents.filter(p => 
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.patentNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <FileText size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Patent Administration</h1>
          </div>
          <p className="text-text-muted text-sm">Global oversight of all IP assets listed on the platform</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs gap-1"><AlertTriangle size={13} /> View Flagged (2)</button>
        </div>
      </motion.div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionHeader title="Global Patent Registry" subtitle={`${filteredPatents.length} records`} />
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or number..." className="input pl-8 text-sm w-56" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patent Details</th>
                <th>Assignee</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Listing Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatents.map(patent => (
                <tr key={patent.id}>
                  <td className="max-w-[250px]">
                    <div className="font-semibold text-xs text-text-primary line-clamp-1 mb-0.5">{patent.title}</div>
                    <div className="text-[10px] text-text-muted font-mono">{patent.patentNumber} • Filed {formatDate(patent.filingDate)}</div>
                  </td>
                  <td className="text-xs">{patent.assignee}</td>
                  <td className="text-xs text-text-muted">{patent.technologyDomain}</td>
                  <td>
                    <span className={cn('badge', patent.status === 'Granted' ? 'badge-success' : 'badge-neutral')}>{patent.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      {patent.isListed ? (
                        <><CheckCircle size={12} className="text-success" /> <span className="text-success">Publicly Listed</span></>
                      ) : (
                        <><ShieldAlert size={12} className="text-warning" /> <span className="text-warning">Draft / Private</span></>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-text-muted hover:bg-navy-50 rounded transition-colors" title="View Details">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors" title="Delist/Flag">
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
