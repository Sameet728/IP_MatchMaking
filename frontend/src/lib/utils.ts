import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-success/10 text-success';
  if (score >= 60) return 'bg-warning/10 text-warning';
  return 'bg-danger/10 text-danger';
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    Granted: 'badge-success',
    Licensed: 'badge-accent',
    Pending: 'badge-warning',
    Filed: 'badge-neutral',
    Abandoned: 'badge-danger',
    Expired: 'badge-neutral',
    Active: 'badge-success',
    Completed: 'badge-success',
    Negotiating: 'badge-warning',
    'NDA Signed': 'badge-accent',
    Inquiry: 'badge-neutral',
    Terminated: 'badge-danger',
    Received: 'badge-success',
    Overdue: 'badge-danger',
    Disputed: 'badge-danger',
  };
  return map[status] || 'badge-neutral';
}

export function getTRLColor(trl: number): string {
  if (trl >= 7) return 'text-success';
  if (trl >= 4) return 'text-warning';
  return 'text-danger';
}
