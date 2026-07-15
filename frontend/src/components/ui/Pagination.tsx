import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit = 20,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn('flex items-center justify-between py-3 px-4 border-t border-border bg-white rounded-b-xl flex-wrap gap-3', className)}>
      <div className="text-xs text-text-muted">
        Showing <span className="font-semibold text-text-primary">{startIdx}</span> to{' '}
        <span className="font-semibold text-text-primary">{endIdx}</span> of{' '}
        <span className="font-semibold text-text-primary">{total}</span> results
      </div>
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-transparent text-text-muted transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page Numbers */}
        {getPages().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-xs text-text-muted font-medium">
                ...
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(Number(p))}
              className={cn(
                'w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-lg border transition-colors',
                isCurrent
                  ? 'border-accent bg-accent text-white hover:bg-accent-hover'
                  : 'border-border text-text-muted hover:bg-navy-50'
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-transparent text-text-muted transition-colors"
          title="Next Page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
