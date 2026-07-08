import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, FileText, CheckCircle, Clock } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_DD = [
  { id: 'DD-001', patent: 'Quantum Encryption Method', status: 'In Progress', progress: 45, assignee: 'Alice S.' },
  { id: 'DD-002', patent: 'Solid-State Battery Tech', status: 'Review Pending', progress: 90, assignee: 'Mark T.' },
  { id: 'DD-003', patent: 'CRISPR Variant Delivery', status: 'Completed', progress: 100, assignee: 'Sarah J.' },
];

export const DueDiligencePage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <ShieldAlert size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Due Diligence Center</h1>
          </div>
          <p className="text-text-muted text-sm">Manage compliance, freedom-to-operate, and technical validation workflows</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Active Investigations" />
        <div className="mt-4 space-y-3">
          {MOCK_DD.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-navy-400" />
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{item.patent}</h3>
                  <div className="text-xs text-text-muted mt-0.5">Assigned to: {item.assignee}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 w-48">
                <div className="flex items-center justify-between w-full text-xs">
                  <span className={item.progress === 100 ? 'text-success font-bold' : 'text-text-muted'}>{item.status}</span>
                  <span className="font-bold">{item.progress}%</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${item.progress === 100 ? 'bg-success' : 'bg-accent'}`} style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
