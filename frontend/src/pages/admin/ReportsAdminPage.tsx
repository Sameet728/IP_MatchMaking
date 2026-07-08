import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

export const ReportsAdminPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <FileText size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Platform Reports</h1>
          </div>
          <p className="text-text-muted text-sm">Generate compliance, financial, and usage reports</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          'Monthly Financial Summary',
          'Compliance & KYC Audit',
          'Platform Usage Metrics',
          'AI Cost Analysis',
          'Deal Flow Pipeline',
          'Active Subscriptions Export'
        ].map(report => (
          <div key={report} className="card hover:border-accent transition-colors cursor-pointer group">
            <h3 className="font-bold text-sm mb-2">{report}</h3>
            <p className="text-xs text-text-muted mb-4">Export CSV or PDF containing all historical data up to the current date.</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs flex-1"><Download size={13} className="mr-1" /> CSV</button>
              <button className="btn-secondary text-xs flex-1"><Printer size={13} className="mr-1" /> PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
