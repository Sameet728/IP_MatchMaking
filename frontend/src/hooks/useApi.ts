import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface PaginationMetadata {
  page: number;
  total: number;
  totalPages: number;
  limit?: number;
  hasMore?: boolean;
}

export function useFetch<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(endpoint);
      setData(res.data.data);
      setPagination(res.data.pagination || null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, pagination, loading, error, refetch: fetchData, setData, setPagination };
}
