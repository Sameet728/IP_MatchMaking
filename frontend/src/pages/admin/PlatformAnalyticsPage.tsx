import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { SectionHeader, StatCard } from '../../components/ui/StatCard';

export const PlatformAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <BarChart3 size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Platform Analytics</h1>
          </div>
          <p className="text-text-muted text-sm">High-level metrics for user growth, engagement, and revenue</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: '12,450', icon: <Users size={14} />, change: 8, trend: 'up' as const },
          { label: 'Active Deals', value: '432', icon: <Activity size={14} />, change: 15, trend: 'up' as const },
          { label: 'Platform Revenue', value: '$2.4M', icon: <TrendingUp size={14} />, change: 24, trend: 'up' as const },
          { label: 'Engagement Score', value: '84/100', icon: <BarChart3 size={14} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} changeLabel="this month" />
          </motion.div>
        ))}
      </div>

      <div className="card h-64 flex flex-col items-center justify-center text-text-muted">
        <BarChart3 size={48} className="mb-4 opacity-20" />
        <p>Detailed charts will be rendered here via Recharts.</p>
      </div>
    </div>
  );
};
