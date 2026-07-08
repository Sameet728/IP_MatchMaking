import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, FileText,
  DollarSign, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const METRICS = [
  { label: 'Total Patents', value: '12', change: '+2', trend: 'up', icon: FileText },
  { label: 'Active Deals', value: '5', change: '+1', trend: 'up', icon: HandshakeIcon },
  { label: 'Total Views', value: '1,204', change: '+15%', trend: 'up', icon: Users },
  { label: 'Estimated Royalties', value: '$240k', change: '-2%', trend: 'down', icon: DollarSign },
];

function HandshakeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-7.3 7.3a1 1 0 0 0 0 1.42l.53.53a1 1 0 0 0 1.42 0l7.3-7.3a3 3 0 0 0 0-4.24l-3.88-3.88a1 1 0 1 0-3 3L6.5 9.5"/></svg>
  );
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  
  const TRAFFIC_DATA = [
    { name: 'Mon', views: 4000, inquiries: 2400 },
    { name: 'Tue', views: 3000, inquiries: 1398 },
    { name: 'Wed', views: 2000, inquiries: 9800 },
    { name: 'Thu', views: 2780, inquiries: 3908 },
    { name: 'Fri', views: 1890, inquiries: 4800 },
    { name: 'Sat', views: 2390, inquiries: 3800 },
    { name: 'Sun', views: 3490, inquiries: 4300 },
  ];

  const DEMOGRAPHICS = [
    { name: 'Startups', value: 400, color: '#10B981' },
    { name: 'Enterprises', value: 300, color: '#2563EB' },
    { name: 'Universities', value: 300, color: '#F59E0B' },
    { name: 'Brokers', value: 200, color: '#8B5CF6' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics Overview</h1>
          <p className="text-sm text-text-muted mt-1">Track the performance and reach of your intellectual property.</p>
        </div>
        <div className="flex gap-2">
          <select className="input py-1.5 text-sm">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
          <button className="btn-primary text-sm">Download Report</button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {METRICS.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Icon size={20} className="text-accent" />
                </div>
                <span className={cn(
                  'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                  metric.trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                )}>
                  {metric.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {metric.change}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text-muted">{metric.label}</h3>
              <p className="text-3xl font-black text-text-primary mt-1">{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[300px]">
          <h3 className="text-sm font-bold text-text-primary mb-4">Traffic & Inquiries Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={TRAFFIC_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="views" stroke="#2563EB" fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="inquiries" stroke="#10B981" fillOpacity={1} fill="url(#colorInq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-1 bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[300px]">
          <h3 className="text-sm font-bold text-text-primary mb-4">Viewer Demographics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={DEMOGRAPHICS} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {DEMOGRAPHICS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {DEMOGRAPHICS.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }}></span>
                  <span className="text-text-muted">{d.name}</span>
                </span>
                <span className="font-bold text-text-primary">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
