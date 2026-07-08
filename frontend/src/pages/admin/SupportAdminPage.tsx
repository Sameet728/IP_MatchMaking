import React from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

export const SupportAdminPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <LifeBuoy size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Support Center</h1>
          </div>
          <p className="text-text-muted text-sm">Manage user tickets, bug reports, and assistance requests</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Active Support Tickets" subtitle="3 tickets pending" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl border border-border flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="mt-1 text-warning"><Clock size={18} /></div>
                <div>
                  <div className="font-bold text-sm text-text-primary">Cannot upload patent PDF</div>
                  <div className="text-xs text-text-muted mt-0.5">User #U-4921 • Opened 2 hours ago</div>
                </div>
              </div>
              <button className="btn-secondary text-xs"><MessageSquare size={14} className="mr-1" /> Reply</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
