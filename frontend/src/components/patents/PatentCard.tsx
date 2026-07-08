import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Handshake, Star } from 'lucide-react';
import { cn, formatCurrency, getStatusBadgeClass } from '../../lib/utils';
import { ScoreRing } from '../ui/StatCard';

export const PatentCard: React.FC<{ patent: any; saved?: boolean; onToggleSave?: (id: string) => void }> = ({ patent, saved = true, onToggleSave }) => {
  return (
    <div className="card card-hover h-full flex flex-col cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-wrap gap-1">
          <span className={cn('badge', getStatusBadgeClass(patent.status))}>{patent.status}</span>
          {patent.isFeatured && <span className="badge badge-accent">Featured</span>}
        </div>
        <button onClick={() => onToggleSave && onToggleSave(patent.id)} className="text-text-muted hover:text-warning transition-colors ml-1">
          <Star size={13} className={saved ? 'fill-warning text-warning' : ''} />
        </button>
      </div>

      <h3 className="text-xs font-bold text-text-primary line-clamp-2 leading-tight mb-1 flex-1">{patent.title}</h3>
      <div className="text-[11px] text-text-muted mb-2">
        {patent.assignee || patent.organization?.name || 'Unknown'} · {patent.country}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className="badge badge-neutral">TRL {patent.trl}</span>
        {patent.domain && <span className="badge badge-neutral">{patent.domain.replace('_', ' ').split(' ')[0]}</span>}
        {patent.technologyDomain && <span className="badge badge-neutral">{patent.technologyDomain.split(' ')[0]}</span>}
      </div>

      <div className="flex items-center justify-between mb-3 mt-auto pt-3 border-t border-border">
        <div>
          <div className="text-base font-black text-text-primary">
            {patent.askingPrice ? formatCurrency(patent.askingPrice) : patent.listingPrice ? formatCurrency(patent.listingPrice) : <span className="text-text-muted text-xs italic">Price on request</span>}
          </div>
          <div className="text-[11px] text-text-muted flex items-center gap-1">
            <Eye size={10} /> {(patent.views || patent.viewCount || 0).toLocaleString()} views
          </div>
        </div>
        {patent.aiReport && (
          <div className="text-right">
            <div className={cn('text-lg font-black', patent.aiReport.overallScore >= 80 ? 'text-success' : 'text-warning')}>{patent.aiReport.overallScore}</div>
            <div className="text-[10px] text-text-muted">AI Score</div>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 mt-3">
        <Link to={`/patents/${patent.id}`} className="btn-ghost text-[11px] flex-1 justify-center py-1.5">View</Link>
        <Link to={`/ai-analysis/${patent.id}`} className="btn-secondary text-[11px] flex-1 justify-center py-1.5">AI</Link>
        <Link to={`/deals/new?patent=${patent.id}`} className="btn-primary text-[11px] px-2 py-1.5 gap-1"><Handshake size={11} /></Link>
      </div>
    </div>
  );
};
