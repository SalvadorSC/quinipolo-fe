import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiUtils';
import { QuinipoloType } from '../../types/quinipolo';

interface UseQuinipolosOptions {
  userId?: string;
  leagueId?: string;
  autoFetch?: boolean;
}

interface UseQuinipolosResult {
  quinipolos: QuinipoloType[];
  loading: boolean;
  error: string | null;
  fetchQuinipolos: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useQuinipolos = ({
  userId,
  leagueId,
  autoFetch = true,
}: UseQuinipolosOptions = {}): UseQuinipolosResult => {
  const [quinipolos, setQuinipolos] = useState<QuinipoloType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuinipolos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: QuinipoloType[];

      if (leagueId) {
        // Fetch quinipolos for a specific league
        data = await apiGet(`/api/leagues/league/${leagueId}/leagueQuinipolos`);
      } else {
        // Fetch quinipolos for the current user
        data = await apiGet('/api/users/me/quinipolos');
      }

      // Sort by end_date (newest to oldest)
      const sortedData = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const aTime = new Date(a.end_date).getTime();
            const bTime = new Date(b.end_date).getTime();
            return bTime - aTime;
          })
        : [];

      setQuinipolos(sortedData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch quinipolos';
      setError(errorMessage);
      console.error('Error fetching quinipolos:', err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (autoFetch && (userId || leagueId)) {
      fetchQuinipolos();
    }
  }, [autoFetch, userId, leagueId, fetchQuinipolos]);

  const refetch = useCallback(async () => {
    await fetchQuinipolos();
  }, [fetchQuinipolos]);

  return {
    quinipolos,
    loading,
    error,
    fetchQuinipolos,
    refetch,
  };
};
