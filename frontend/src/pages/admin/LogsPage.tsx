import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, AlertCircle, Clock } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';

const MOCK_LOGS = [
  { id: 'L-8821', action: 'User Login', user: 'admin@platform.com', ip: '192.168.1.1', time: '2 mins ago', level: 'Info' },
  { id: 'L-8820', action: 'API Key Generated', user: 'system_auth', ip: 'Internal', time: '15 mins ago', level: 'Warning' },
  { id: 'L-8819', action: 'Patent Deleted', user: 'john.d@enterprise.com', ip: '203.0.113.42', time: '1 hour ago', level: 'Critical' },
  { id: 'L-8818', action: 'Deal Status Changed', user: 'broker_mike@ip.com', ip: '198.51.100.12', time: '3 hours ago', level: 'Info' },
];

export const LogsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <Terminal size={16} className="text-white" />
            </div>
            <h1 className="page-title">Audit Logs</h1>
          </div>
          <p className="text-text-muted text-sm">Security, access, and system-level event tracking</p>
        </div>
      </motion.div>

      <div className="card bg-navy-900 border-navy-700 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-accent" />
          <h2 className="text-sm font-bold">Live Security Feed</h2>
        </div>
        
        <div className="space-y-1 font-mono text-[11px]">
          {MOCK_LOGS.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-2 hover:bg-navy-800 rounded">
              <div className="text-navy-400 shrink-0 w-24">{log.time}</div>
              <div className={`shrink-0 w-20 font-bold ${log.level === 'Info' ? 'text-blue-400' : log.level === 'Warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                [{log.level}]
              </div>
              <div className="text-navy-200 shrink-0 w-48">{log.user}</div>
              <div className="text-white flex-1">{log.action}</div>
              <div className="text-navy-500 shrink-0">{log.ip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
