import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpCircle, Shield } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_SUBS = [
  { company: 'Global Tech Enterprise', plan: 'Enterprise', mrr: 199.99, status: 'Active', renewal: 'Aug 1, 2026' },
  { company: 'Stanford University', plan: 'Enterprise', mrr: 199.99, status: 'Active', renewal: 'Sep 15, 2026' },
  { company: 'BioTech Solutions', plan: 'Professional', mrr: 49.99, status: 'Active', renewal: 'Jul 20, 2026' },
  { company: 'Quantum Innovations', plan: 'Starter', mrr: 9.99, status: 'Past Due', renewal: 'Jul 1, 2026' },
];

export const SubscriptionsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <CreditCard size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Subscription Management</h1>
          </div>
          <p className="text-text-muted text-sm">Monitor SaaS revenue, organization tiers, and billing cycles</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Active Subscriptions" />
        
        <div className="overflow-x-auto mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan Tier</th>
                <th>MRR</th>
                <th>Renewal Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SUBS.map((sub, i) => (
                <tr key={i}>
                  <td className="text-xs font-semibold">{sub.company}</td>
                  <td>
                    <span className="badge badge-neutral text-[10px] uppercase">{sub.plan}</span>
                  </td>
                  <td className="text-sm font-bold text-success">${sub.mrr}</td>
                  <td className="text-xs text-text-muted">{sub.renewal}</td>
                  <td>
                    <span className={`badge ${sub.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{sub.status}</span>
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
