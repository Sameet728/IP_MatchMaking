import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Star } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_INVENTORS = [
  { id: 1, name: 'Dr. Alan Turing', department: 'Computer Science', patents: 12, royalties: '$45,000' },
  { id: 2, name: 'Dr. Marie Curie', department: 'Physics & Chemistry', patents: 4, royalties: '$120,000' },
  { id: 3, name: 'Dr. Rosalind Franklin', department: 'Biology', patents: 7, royalties: '$85,000' },
];

export const InventorsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Users size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Faculty & Inventors</h1>
          </div>
          <p className="text-text-muted text-sm">Manage university researchers, their portfolios, and royalty shares</p>
        </div>
      </motion.div>

      <div className="card">
        <SectionHeader title="Top Researchers" />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inventor Name</th>
                <th>Department</th>
                <th>Active Patents</th>
                <th>Royalty Share Generated</th>
                <th className="text-right">Contact</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVENTORS.map(inv => (
                <tr key={inv.id}>
                  <td className="font-bold text-sm">{inv.name}</td>
                  <td className="text-xs text-text-muted">{inv.department}</td>
                  <td><span className="badge badge-neutral">{inv.patents} Patents</span></td>
                  <td className="text-sm font-bold text-success">{inv.royalties}</td>
                  <td className="text-right">
                    <button className="btn-secondary text-xs"><Mail size={13} className="mr-1" /> Message</button>
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
