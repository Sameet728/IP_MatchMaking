import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, AlertCircle, Clock } from 'lucide-react';
import { SectionHeader } from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useApi';
import { Pagination } from '../../components/ui/Pagination';

export const LogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: fetchedLogs, pagination, loading } = useFetch<any[]>(`/admin/audit-logs?page=${page}&limit=20`, [page]);
  const logs = fetchedLogs || [];

  const getLogLevel = (action: string) => {
    if (action.includes('DELETE') || action.includes('ERROR') || action.includes('FAILED')) return 'Critical';
    if (action.includes('UPDATE') || action.includes('CREATE') || action.includes('GENERATE') || action.includes('ADMIN')) return 'Warning';
    return 'Info';
  };

  const formatLogTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

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

      <div className="card bg-navy-900 border-navy-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            <h2 className="text-sm font-bold">Live Security Feed</h2>
          </div>
          {loading && <span className="text-xs text-text-muted">Loading logs...</span>}
        </div>
        
        <div className="space-y-1.5 font-mono text-[11px] min-h-[300px]">
          {logs.map(log => {
            const level = getLogLevel(log.action);
            return (
              <div key={log.id} className="flex items-start gap-4 p-2 hover:bg-navy-800 rounded transition-colors border-b border-navy-800/40">
                <div className="text-navy-400 shrink-0 w-36">{formatLogTime(log.createdAt)}</div>
                <div className={`shrink-0 w-20 font-bold ${level === 'Info' ? 'text-blue-400' : level === 'Warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                  [{level}]
                </div>
                <div className="text-navy-200 shrink-0 w-44 truncate" title={log.user?.email || 'System'}>
                  {log.user?.name || 'System'}
                </div>
                <div className="text-white flex-1 truncate" title={log.action}>
                  {log.action} {log.entity && `(${log.entity}:${log.entityId})`}
                </div>
                <div className="text-navy-500 shrink-0">{log.ipAddress || 'Internal'}</div>
              </div>
            );
          })}
          {!loading && logs.length === 0 && (
            <div className="text-center text-text-muted py-8">No logs found.</div>
          )}
        </div>

        {pagination && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={20}
            onPageChange={setPage}
            className="mt-6 border-t border-navy-800 bg-navy-900 rounded-b-xl text-white py-4 px-0"
          />
        )}
      </div>
    </div>
  );
};

