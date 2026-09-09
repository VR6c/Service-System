import { useState, useMemo, useEffect, useCallback } from 'react';

export interface UsePaginationOptions<T> {
  data: T[];
  initialPageSize?: number;
  resetDeps?: any[];
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePagination<T>({
  data,
  initialPageSize = 15,
  resetDeps = []
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  // Automatically reset to page 1 if external filters/search dependencies change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // If total items decrease and current page is out of bounds, adjust gracefully
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    currentPage: safePage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    paginatedData,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage
  };
}
