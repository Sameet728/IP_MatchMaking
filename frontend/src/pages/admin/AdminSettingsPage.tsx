import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Shield } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Settings size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">Platform Settings</h1>
          </div>
          <p className="text-text-muted text-sm">Global configurations for the matchmaking engine</p>
        </div>
        <button className="btn-primary text-xs gap-1"><Save size={13} /> Save Configuration</button>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="Matching Algorithm" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Minimum Match Score Threshold</label>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
              <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>0%</span><span>75%</span><span>100%</span></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">AI Generation Model</label>
              <select className="input w-full text-sm">
                <option>Gemini 1.5 Pro</option>
                <option>Gemini 1.5 Flash</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionHeader title="Financial Settings" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Global Platform Fee (%)</label>
              <input type="number" defaultValue="5" className="input w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Default Currency</label>
              <select className="input w-full text-sm">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
