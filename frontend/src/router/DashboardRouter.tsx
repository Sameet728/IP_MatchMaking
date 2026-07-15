import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

// Role -> dashboard component mapping
import { InventorDashboard } from '../pages/dashboards/InventorDashboard';
import { UniversityDashboard } from '../pages/dashboards/UniversityDashboard';
import { StartupDashboard } from '../pages/dashboards/StartupDashboard';
import { EnterpriseDashboard } from '../pages/dashboards/EnterpriseDashboard';
import { BrokerDashboard } from '../pages/dashboards/BrokerDashboard';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard';

const ROLE_DASHBOARDS: Record<UserRole, React.ComponentType> = {
  inventor: InventorDashboard,
  university: UniversityDashboard,
  startup: StartupDashboard,
  enterprise: EnterpriseDashboard,
  broker: BrokerDashboard,
  admin: AdminDashboard,
};

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/auth/login" replace />;
  const role = (user.role?.toLowerCase() as UserRole) || 'inventor';
  const Dashboard = ROLE_DASHBOARDS[role] || InventorDashboard;
  return <Dashboard />;
};

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
