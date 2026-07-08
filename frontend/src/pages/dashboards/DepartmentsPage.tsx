import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Activity } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';
import { UNIVERSITY_DEPARTMENTS } from '../../data/mockData';

export const DepartmentsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Building size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">University Departments</h1>
          </div>
          <p className="text-text-muted text-sm">Tech Transfer Office oversight across all academic faculties</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UNIVERSITY_DEPARTMENTS.map(dept => (
          <div key={dept.dept} className="card hover:border-accent transition-colors">
            <h3 className="font-bold text-sm text-text-primary mb-4">{dept.dept}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1"><Activity size={12}/> Patents</span>
                <span className="font-bold">{dept.patents}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1"><Users size={12}/> Spin-offs</span>
                <span className="font-bold">{dept.licensed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
