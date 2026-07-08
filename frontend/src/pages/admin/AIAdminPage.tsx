import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Server, Activity, AlertTriangle, Zap } from 'lucide-react';
import { SectionHeader, StatCard } from '../../components/ui/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AI_USAGE_DATA = [
  { time: '00:00', requests: 120 }, { time: '04:00', requests: 85 },
  { time: '08:00', requests: 350 }, { time: '12:00', requests: 500 },
  { time: '16:00', requests: 480 }, { time: '20:00', requests: 290 },
];

export const AIAdminPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Brain size={16} className="text-accent" />
            </div>
            <h1 className="page-title">AI Engine Monitoring</h1>
          </div>
          <p className="text-text-muted text-sm">Monitor Gemini API usage, Pinecone vector status, and generation queues</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'API Requests (24h)', value: '18,452', icon: <Activity size={14} />, change: 12, trend: 'up' as const },
          { label: 'Avg Latency', value: '1.2s', icon: <Zap size={14} />, change: -5, trend: 'down' as const },
          { label: 'Vector Index Size', value: '45.2 MB', icon: <Server size={14} /> },
          { label: 'Error Rate', value: '0.04%', icon: <AlertTriangle size={14} /> },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="API Request Volume" subtitle="Requests to Gemini endpoints over 24h" />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={AI_USAGE_DATA}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#3B82F6" fillOpacity={1} fill="url(#colorReq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="System Status" />
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-success"><Cpu size={20} /></div>
                <div>
                  <div className="font-bold text-sm">Gemini API Service</div>
                  <div className="text-xs text-text-muted">Operational • 99.99% Uptime</div>
                </div>
              </div>
              <span className="badge badge-success">Online</span>
            </div>
            
            <div className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-success"><Server size={20} /></div>
                <div>
                  <div className="font-bold text-sm">Pinecone Vector DB</div>
                  <div className="text-xs text-text-muted">Operational • Region: us-east-1</div>
                </div>
              </div>
              <span className="badge badge-success">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
