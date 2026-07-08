import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, CreditCard, Shield, Bell,
  Key, Save, CheckCircle2, ChevronRight, Upload
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await api.post('/api/billing/subscribe', { planId });
      alert('Subscription upgraded successfully! (Mock Demo)');
    } catch (e) {
      alert('Failed to upgrade subscription.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account settings, organization details, and subscriptions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-muted hover:bg-navy-50 hover:text-text-primary'
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-6">Profile Information</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center text-2xl font-bold text-navy-400">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <button className="btn-secondary text-sm gap-2 mb-2">
                    <Upload size={16} /> Upload New Avatar
                  </button>
                  <p className="text-xs text-text-muted">JPG, GIF or PNG. Max size of 800K.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="input w-full" disabled />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Designation</label>
                  <input type="text" defaultValue={(user as any)?.designation || 'Lead Researcher'} className="input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Phone</label>
                  <input type="tel" defaultValue="+1 (555) 000-0000" className="input w-full" />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Bio</label>
                <textarea rows={4} className="input w-full" defaultValue="Passionate researcher focused on sustainable energy and solid-state battery technology." />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="btn-primary w-32 flex justify-center">
                  {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    saved ? <><CheckCircle2 size={16} className="mr-2" /> Saved</> : <><Save size={16} className="mr-2" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-navy-900 text-white min-h-full p-6 md:p-8 rounded-xl m-1">
              <h2 className="text-lg font-bold mb-2">Subscription & Billing</h2>
              <p className="text-sm text-navy-300 mb-8">Manage your subscription plan and payment methods.</p>

              <div className="bg-navy-800 border border-navy-700 p-5 rounded-lg mb-8 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">Current Plan</span>
                  <div className="text-xl font-bold flex items-center gap-2">
                    Starter <span className="badge bg-navy-700 text-navy-300 text-[10px]">Active</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">Next billing date: August 1, 2026</p>
                </div>
                <button className="btn-secondary border-navy-600 text-white hover:bg-navy-700">Cancel Plan</button>
              </div>

              <h3 className="text-sm font-bold mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'price_starter', name: 'Starter', price: '$9.99', features: ['Up to 5 Patents', 'Basic Analytics', 'Standard Support'], current: true },
                  { id: 'price_pro', name: 'Professional', price: '$49.99', features: ['Up to 50 Patents', 'Advanced Analytics', 'Priority Support', 'AI Matchmaking'], current: false },
                  { id: 'price_ent', name: 'Enterprise', price: '$199.99', features: ['Unlimited Patents', 'Custom Reports', 'Dedicated Account Manager', 'API Access'], current: false },
                ].map(plan => (
                  <div key={plan.name} className={cn('bg-navy-800 border rounded-xl p-5 flex flex-col', plan.current ? 'border-accent' : 'border-navy-700')}>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg">{plan.name}</h4>
                      <div className="text-2xl font-black mt-2">{plan.price}<span className="text-sm text-navy-400 font-normal">/mo</span></div>
                    </div>
                    <div className="flex-1 space-y-3 mb-6">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-navy-200">
                          <CheckCircle2 size={16} className="text-accent shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => !plan.current && handleSubscribe(plan.id)}
                      disabled={plan.current}
                      className={cn('w-full py-2.5 rounded-lg text-sm font-semibold transition-colors', 
                        plan.current ? 'bg-navy-700 text-navy-400 cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-hover')}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-6">Organization Profile</h2>
              <div className="bg-navy-50 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                <Building2 size={48} className="text-navy-300 mb-4" />
                <h3 className="text-base font-bold text-text-primary mb-1">Organization Settings Available in Phase 8</h3>
                <p className="text-sm text-text-muted max-w-md">The organizational management panel will be fully implemented in the next phase, allowing you to manage team members and departments.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-6">Security & Authentication</h2>
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">Change Password</h3>
                    <p className="text-xs text-text-muted">Ensure your account is using a long, random password.</p>
                  </div>
                  <button className="btn-secondary text-sm">Update</button>
                </div>
                <div className="border border-border rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-text-muted">Add additional security to your account using an authenticator app.</p>
                  </div>
                  <button className="btn-primary text-sm">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: 'New Deal Inquiries', desc: 'Get notified when a company requests an NDA.' },
                  { title: 'AI Match Alerts', desc: 'Receive alerts when the AI Engine finds a high-scoring match.' },
                  { title: 'Message Received', desc: 'Push notifications for real-time deal room chat.' },
                  { title: 'Marketing Updates', desc: 'Platform news and feature announcements.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                      <div className="w-9 h-5 bg-navy-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
