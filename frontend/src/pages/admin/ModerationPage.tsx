import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_REPORTS = [
  { id: 1, type: 'Message', reporter: 'Alice S.', target: 'John D.', reason: 'Spam/Phishing attempt', date: '2 hours ago', status: 'Pending' },
  { id: 2, type: 'Patent', reporter: 'System AI', target: 'Patent #US-2024-88', reason: 'Possible plagiarism / duplication', date: '5 hours ago', status: 'Pending' },
  { id: 3, type: 'User Profile', reporter: 'Admin (Manual)', target: 'Company XYZ', reason: 'Fake credentials uploaded', date: '1 day ago', status: 'Reviewed' },
];

export const ModerationPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
              <ShieldAlert size={16} className="text-danger" />
            </div>
            <h1 className="page-title">Content Moderation</h1>
          </div>
          <p className="text-text-muted text-sm">Review flagged messages, disputes, and suspicious platform activity</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Active Reports" subtitle="Requires immediate attention" />
        <div className="mt-4 space-y-3">
          {MOCK_REPORTS.map(report => (
            <div key={report.id} className="p-4 rounded-xl border border-border hover:bg-navy-50 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="mt-1 text-danger"><AlertCircle size={18} /></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-text-primary">{report.target}</span>
                    <span className="badge badge-neutral text-[10px]">{report.type}</span>
                  </div>
                  <div className="text-xs text-text-primary font-medium">Reason: {report.reason}</div>
                  <div className="text-[11px] text-text-muted mt-1">Reported by {report.reporter} • {report.date}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn-ghost text-xs"><MessageSquare size={14} /> Context</button>
                <button className="btn-secondary text-xs text-danger border-danger/20 hover:bg-danger/10"><Trash2 size={14} /> Remove</button>
                <button className="btn-primary text-xs"><CheckCircle size={14} /> Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
