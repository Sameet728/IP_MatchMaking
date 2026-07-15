import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Shield, MoreVertical, Edit, Trash2, Mail, CheckCircle } from 'lucide-react';
import { useFetch } from '../../hooks/useApi';
import { cn, formatDate } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-danger/10 text-danger border-danger/20',
  ENTERPRISE: 'bg-primary/10 text-primary border-primary/20',
  STARTUP: 'bg-accent/10 text-accent border-accent/20',
  UNIVERSITY: 'bg-success/10 text-success border-success/20',
  INVENTOR: 'bg-warning/10 text-warning border-warning/20',
  BROKER: 'bg-navy-200/50 text-navy-600 border-navy-300',
};

export const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const { data: fetchedUsers, loading } = useFetch<any[]>('/admin/users');
  const users = fetchedUsers || [];

  if (loading) return <div className="p-6 text-text-muted">Loading users...</div>;

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (roleFilter === 'All' || u.role === roleFilter.toUpperCase()) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
              <Users size={16} className="text-navy-600" />
            </div>
            <h1 className="page-title">User Management</h1>
          </div>
          <p className="text-text-muted text-sm">Manage user accounts, roles, permissions, and security settings</p>
        </div>
        <button className="btn-primary text-xs gap-1">Invite User</button>
      </motion.div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionHeader title="All Platform Users" subtitle={`${filteredUsers.length} total users`} />
          <div className="flex gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-8 text-sm w-48" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input text-sm w-36">
              {['All', 'Admin', 'Enterprise', 'Startup', 'University', 'Inventor', 'Broker'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-600 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-text-primary">{user.name}</div>
                        <div className="text-[11px] text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border', ROLE_COLORS[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-xs text-text-muted">{user.organization?.name || '—'}</td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs">
                      {user.verified ? (
                        <><CheckCircle size={12} className="text-success" /> <span className="text-success font-medium">Verified</span></>
                      ) : (
                        <><Shield size={12} className="text-warning" /> <span className="text-warning font-medium">Pending</span></>
                      )}
                    </div>
                  </td>
                  <td className="text-xs text-text-muted">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-text-muted hover:bg-navy-50 rounded transition-colors" title="Email User">
                        <Mail size={14} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:bg-navy-50 rounded transition-colors" title="Edit User">
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors" title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
