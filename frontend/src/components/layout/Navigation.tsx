import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, FileText, Brain, BarChart3, Users, Building2,
  ShoppingBag, Handshake, DollarSign, Bell, Search, Settings,
  LogOut, ChevronLeft, ChevronRight, Shield, Briefcase,
  TrendingUp, MessageSquare, Archive, Globe, Star, Menu, X,
  FlaskConical, Gavel, Receipt, UserCheck, LifeBuoy, Activity,
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import type { UserRole } from '../../types';

// ─── Navigation config per role ───────────────────────────────
const NAV_ITEMS: Record<UserRole, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; href: string; badge?: number }[]> = {
  inventor: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'My Patents', icon: FileText, href: '/patents' },
    { label: 'AI Analysis', icon: Brain, href: '/ai-analysis' },
    { label: 'AI Match', icon: Activity, href: '/ai-match' },
    { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
    { label: 'Deals', icon: Handshake, href: '/deals' },
    { label: 'Royalties', icon: DollarSign, href: '/royalties' },
    { label: 'Messages', icon: MessageSquare, href: '/messages', badge: 3 },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Reports', icon: TrendingUp, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
  university: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Patent Portfolio', icon: Archive, href: '/patents' },
    { label: 'Departments', icon: Building2, href: '/departments' },
    { label: 'AI Engine', icon: Brain, href: '/ai-analysis' },
    { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
    { label: 'Licensing', icon: Gavel, href: '/licensing' },
    { label: 'Deals', icon: Handshake, href: '/deals' },
    { label: 'Royalties', icon: DollarSign, href: '/royalties' },
    { label: 'Inventors', icon: Users, href: '/inventors' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Reports', icon: TrendingUp, href: '/reports' },
    { label: 'Messages', icon: MessageSquare, href: '/messages', badge: 7 },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
  startup: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Browse IP', icon: Globe, href: '/marketplace' },
    { label: 'Saved', icon: Star, href: '/saved' },
    { label: 'AI Match', icon: Brain, href: '/ai-match' },
    { label: 'Licensing Requests', icon: Gavel, href: '/licensing' },
    { label: 'Deals', icon: Handshake, href: '/deals' },
    { label: 'Messages', icon: MessageSquare, href: '/messages', badge: 2 },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Reports', icon: TrendingUp, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
  enterprise: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'IP Scouting', icon: Search, href: '/marketplace' },
    { label: 'AI Match Engine', icon: Brain, href: '/ai-match' },
    { label: 'Portfolio', icon: Briefcase, href: '/portfolio' },
    { label: 'Acquisitions', icon: ShoppingBag, href: '/acquisitions' },
    { label: 'Due Diligence', icon: FlaskConical, href: '/due-diligence' },
    { label: 'Licensing', icon: Gavel, href: '/licensing' },
    { label: 'Royalties', icon: Receipt, href: '/royalties' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Messages', icon: MessageSquare, href: '/messages', badge: 5 },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
  broker: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Active Deals', icon: Handshake, href: '/deals' },
    { label: 'Patent Search', icon: Search, href: '/marketplace' },
    { label: 'AI Matching', icon: Brain, href: '/ai-match' },
    { label: 'Commissions', icon: DollarSign, href: '/commissions' },
    { label: 'Negotiations', icon: MessageSquare, href: '/messages', badge: 9 },
    { label: 'Reports', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
  admin: [
    { label: 'Platform Overview', icon: Activity, href: '/dashboard' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Organizations', icon: Building2, href: '/admin/organizations' },
    { label: 'Patents', icon: FileText, href: '/admin/patents' },
    { label: 'Deals & Licenses', icon: Handshake, href: '/admin/deals' },
    { label: 'AI Monitoring', icon: Brain, href: '/admin/ai' },
    { label: 'Moderation', icon: Shield, href: '/admin/moderation' },
    { label: 'Royalties', icon: DollarSign, href: '/admin/royalties' },
    { label: 'Subscriptions', icon: Receipt, href: '/admin/subscriptions' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Reports', icon: TrendingUp, href: '/admin/reports' },
    { label: 'Support', icon: LifeBuoy, href: '/admin/support' },
    { label: 'Audit Logs', icon: UserCheck, href: '/admin/logs' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ],
};

const ROLE_COLORS: Record<UserRole, string> = {
  inventor: 'bg-accent/15 text-accent',
  university: 'bg-success/15 text-success',
  startup: 'bg-warning/15 text-warning',
  enterprise: 'bg-navy-700 text-white',
  broker: 'bg-purple-500/15 text-purple-500',
  admin: 'bg-danger/15 text-danger',
};

const ROLE_LABELS: Record<UserRole, string> = {
  inventor: 'Inventor',
  university: 'University TTO',
  startup: 'Startup',
  enterprise: 'Enterprise',
  broker: 'IP Broker',
  admin: 'Administrator',
};

// ─── Sidebar ──────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const role = (user?.role?.toLowerCase() as UserRole) || 'inventor';
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.inventor;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-navy-900 border-r border-navy-800 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-navy-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <div className="text-sm font-bold text-white leading-tight">IP COS</div>
              <div className="text-[10px] text-navy-400 leading-tight">Commercialization OS</div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Role badge */}
      {!collapsed && user && (
        <div className="px-4 py-2.5 border-b border-navy-800">
          <span className={cn('badge text-[10px] font-semibold', ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
          </span>
          <div className="text-xs text-navy-300 font-medium mt-0.5 truncate">{user.name}</div>
          <div className="text-[10px] text-navy-500 truncate">{user.organization || 'Independent'}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} to={item.href} title={collapsed ? item.label : undefined}>
              <div className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item', 'mb-0.5 relative')}>
                <item.icon size={16} className="shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium flex-1 truncate">{item.label}</span>
                )}
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="border-t border-navy-800 p-2">
        <button onClick={handleLogout} className={cn('sidebar-item w-full', 'text-danger/70 hover:text-danger hover:bg-danger/10')}>
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-navy-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} className="text-text-muted" /> : <ChevronLeft size={12} className="text-text-muted" />}
      </button>
    </motion.aside>
  );
};

// ─── Top Nav ──────────────────────────────────────────────────
interface TopNavProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ title, onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  React.useEffect(() => {
    if (!socket) return;
    const handleNotif = (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    };
    socket.on('new_notification', handleNotif);
    return () => { socket.off('new_notification', handleNotif); };
  }, [socket]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0 relative z-20">
      {/* Mobile menu */}
      <button className="md:hidden btn-ghost p-1.5" onClick={onMobileMenuToggle}>
        <Menu size={18} />
      </button>

      {/* Page title */}
      {title && <h1 className="text-sm font-semibold text-text-primary hidden sm:block">{title}</h1>}

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search patents, companies, deals..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-navy-50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-text-muted"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted bg-white border border-border rounded px-1 hidden sm:block">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="btn-ghost p-2 relative"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-border shadow-dropdown overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold">Notifications</span>
                  <span className="badge badge-accent">{unread} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-text-muted">No notifications yet.</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className={cn('px-4 py-3 border-b border-border hover:bg-navy-50 cursor-pointer transition-colors', !n.read && 'bg-accent/3')}>
                      <div className="flex items-start gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full mt-2 shrink-0', !n.read ? 'bg-accent' : 'bg-transparent')} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-text-primary truncate">{n.title}</div>
                          <div className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-text-muted mt-1">
                            {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-xs text-accent font-medium hover:underline">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-navy-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-text-primary leading-tight max-w-28 truncate">{user?.name}</div>
              <div className="text-[10px] text-text-muted capitalize">{user?.role}</div>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-border shadow-dropdown overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-xs font-semibold text-text-primary truncate">{user?.name}</div>
                  <div className="text-[11px] text-text-muted truncate">{user?.email}</div>
                </div>
                <div className="py-1">
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-navy-50 transition-colors">
                    <Settings size={13} /> Profile Settings
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/auth/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-danger hover:bg-danger/5 transition-colors"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
};
