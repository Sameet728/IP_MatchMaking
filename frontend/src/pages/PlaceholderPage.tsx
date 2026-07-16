import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Generic placeholder for unbuilt pages (future phases)
export const PlaceholderPage: React.FC<{ title?: string }> = ({ title }) => {
  const location = useLocation();
  const pageName = title || location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Page';

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-56px)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Construction size={24} className="text-accent" />
        </div>
        <h2 className="text-lg font-bold text-text-primary capitalize mb-1">{pageName}</h2>
        <p className="text-sm text-text-muted mb-4">
          This module is part of the full platform and will be built in upcoming phases.
          The architecture, types, and data layer are already in place.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link to="/dashboard" className="btn-primary text-xs"><ArrowLeft size={12} /> Dashboard</Link>
        </div>
        <div className="mt-6 p-3 bg-navy-50 rounded-lg border border-border text-left">
          <p className="text-[11px] text-text-muted font-mono">Route: <span className="text-accent">{location.pathname}</span></p>
          <p className="text-[11px] text-text-muted font-mono mt-0.5">Status: <span className="text-warning">Planned — Phase 2+</span></p>
        </div>
      </motion.div>
    </div>
  );
};

// Profile/Settings page with basic info
export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="page-title mb-6">Profile & Settings</h1>
        <div className="card mb-4">
          <h2 className="section-title mb-4">Account Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" defaultValue={user?.name} /></div>
            <div><label className="label">Email</label><input className="input" defaultValue={user?.email} disabled /></div>
            <div><label className="label">Organization</label><input className="input" defaultValue={typeof user?.organization === 'string' ? user.organization : (user?.organization as any)?.name || ''} /></div>
            <div><label className="label">Role</label><input className="input" defaultValue={user?.role} disabled /></div>
          </div>
          <button className="btn-primary mt-4">Save Changes</button>
        </div>
        <div className="card">
          <h2 className="section-title mb-4">Security</h2>
          <div className="space-y-3">
            <div><label className="label">Current Password</label><input type="password" className="input" placeholder="••••••••" /></div>
            <div><label className="label">New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
          </div>
          <button className="btn-secondary mt-4">Update Password</button>
        </div>
      </motion.div>
    </div>
  );
};
