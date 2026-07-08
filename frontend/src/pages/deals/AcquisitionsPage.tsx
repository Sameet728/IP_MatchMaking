import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Search } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_ACQ = [
  { id: 'ACQ-992', target: 'Neural Link Protocols IP Portfolio', status: 'Negotiating', value: '$12.5M' },
  { id: 'ACQ-991', target: 'Biodegradable Plastics Formula', status: 'Closed', value: '$4.2M' },
];

export const AcquisitionsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Briefcase size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Acquisitions Pipeline</h1>
          </div>
          <p className="text-text-muted text-sm">Track full IP portfolio buyouts and M&A intellectual property transfers</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Active Buyouts" />
        <div className="mt-4 space-y-3">
          {MOCK_ACQ.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">{item.target}</h3>
                <div className="text-xs text-text-muted mt-0.5">Ref: {item.id}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-success">{item.value}</div>
                <div className={`text-xs font-semibold ${item.status === 'Closed' ? 'text-success' : 'text-warning'}`}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
