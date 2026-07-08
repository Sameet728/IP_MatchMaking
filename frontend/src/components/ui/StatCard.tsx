import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  prefix?: string;
  isCurrency?: boolean;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, change, changeLabel, trend, icon, className, prefix, isCurrency, delay = 0,
}) => {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn('card group hover:shadow-card-hover transition-all duration-200', className)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-md bg-accent/8 flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-text-primary">
          {prefix}{displayValue}
        </span>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend === 'up' && <TrendingUp size={13} className="text-success" />}
          {trend === 'down' && <TrendingDown size={13} className="text-danger" />}
          {trend === 'neutral' && <Minus size={13} className="text-text-muted" />}
          <span className={cn(
            'text-xs font-medium',
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'
          )}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-text-muted">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
};

// Score indicator ring
interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 80, label, className }) => {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="text-center -mt-[calc(50%+4px)] mb-[calc(50%-4px)] relative" style={{ marginTop: -(size / 2 + 4), marginBottom: (size / 2 - 4) }}>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      {label && <span className="text-xs text-text-muted font-medium">{label}</span>}
    </div>
  );
};

// Status badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const classes = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    accent: 'badge-accent',
    neutral: 'badge-neutral',
  };
  return <span className={cn(classes[variant], className)}>{children}</span>;
};

// Progress bar
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, className, color, showLabel = false, size = 'sm'
}) => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color || (pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-navy-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-text-muted w-7 text-right">{Math.round(pct)}</span>}
    </div>
  );
};

// Section header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-start justify-between mb-4', className)}>
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Empty state
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center text-text-muted mb-4">{icon}</div>}
    <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
    {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Loading skeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-navy-100 rounded', className)} />
);

export const CardSkeleton: React.FC = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);
