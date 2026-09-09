import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select } from './Select';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 25, 50],
  className = '',
  itemLabel = 'records'
}) => {
  if (totalItems === 0) return null;

  // Generate page numbers with ellipses for smooth navigation
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`px-4 sm:px-5 py-3 bg-white border-t border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600 no-print select-none ${className}`}
    >
      {/* Left: Summary & Per Page Selector */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full md:w-auto">
        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold font-mono text-slate-900">{startIndex}</span>–
          <span className="font-bold font-mono text-slate-900">{endIndex}</span> of{' '}
          <span className="font-bold font-mono text-slate-900">{totalItems}</span> {itemLabel}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-200">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Per page:</span>
            <Select
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: `${opt} / page`
              }))}
              direction="up"
              size="sm"
              className="w-auto"
              buttonClassName="py-1 px-2.5 bg-slate-50 hover:bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-2xs gap-1.5"
              menuClassName="w-auto min-w-[110px]"
            />
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1 w-full md:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
          title="First page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          title="Previous page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numeric Page Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-bold select-none"
                >
                  …
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white border border-red-600 shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Compact Page Display (Mobile) */}
        <div className="sm:hidden px-2 text-xs font-mono font-bold text-slate-800">
          {currentPage} / {totalPages}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          title="Next page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
          title="Last page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
