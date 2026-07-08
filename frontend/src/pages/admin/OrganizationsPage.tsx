import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Plus, MapPin, Users, Activity, CheckCircle, Shield } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_ORGS = [
  { id: '1', name: 'Global Tech Enterprise', type: 'Enterprise', users: 14, location: 'San Francisco, CA', status: 'Verified', plan: 'Enterprise' },
  { id: '2', name: 'Stanford University', type: 'University', users: 45, location: 'Stanford, CA', status: 'Verified', plan: 'Enterprise' },
  { id: '3', name: 'Quantum Innovations', type: 'Startup', users: 3, location: 'Boston, MA', status: 'Pending', plan: 'Starter' },
  { id: '4', name: 'MIT Tech Transfer', type: 'University', users: 32, location: 'Cambridge, MA', status: 'Verified', plan: 'Enterprise' },
  { id: '5', name: 'BioTech Solutions', type: 'Enterprise', users: 8, location: 'London, UK', status: 'Verified', plan: 'Professional' },
];

export const OrganizationsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredOrgs = MOCK_ORGS.filter(o => 
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Building2 size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Organizations</h1>
          </div>
          <p className="text-text-muted text-sm">Manage institutional accounts, enterprise subscriptions, and tech transfer offices</p>
        </div>
        <button className="btn-primary text-xs gap-1"><Plus size={13} /> Add Organization</button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <SectionHeader title="Registered Organizations" subtitle={`${filteredOrgs.length} active`} />
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..." className="input pl-8 text-sm w-48" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrgs.map(org => (
              <div key={org.id} className="p-4 rounded-xl border border-border hover:border-accent hover:bg-navy-50 transition-all flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-navy-400">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">{org.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Shield size={11} /> {org.type}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {org.location}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {org.users} Members</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn('badge', org.status === 'Verified' ? 'badge-success' : 'badge-warning')}>{org.status}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{org.plan} Plan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <SectionHeader title="Quick Actions" />
            <div className="space-y-2 mt-3">
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-navy-50 text-xs font-semibold">Verify Pending Organizations (1)</button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-navy-50 text-xs font-semibold">Export Organization Data</button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-navy-50 text-xs font-semibold">Manage API Access</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
