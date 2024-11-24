import { useState, useCallback } from 'react';

export interface PaginationState {
  pageIndex: number,
  pageSize: number
}

const DEFAULT_PAGINATION_STATE: PaginationState = { pageIndex: 0, pageSize: 20 };

export function usePagination(initialState: PaginationState = DEFAULT_PAGINATION_STATE) {
  const [pagination, setPagination] = useState<PaginationState>(initialState);

  const handlePageIndexChange = useCallback((pageIndex: number) => setPagination(p => ({
    ...p,
    pageIndex
  })), []);
  const handlePageSizeChange = useCallback((pageSize: string | null) => setPagination(p => ({
    ...p,
    pageSize: Number(pageSize)
  })), []);

  return {
    pagination,
    setPagination,
    handlePageIndexChange,
    handlePageSizeChange
  };
}
