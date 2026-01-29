import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiUtils';

interface LeagueData {
  leagueId: string;
  leagueName: string;
  participants: string[];
  icon_style?: {
    icon?: string;
    accent_color?: string;
    icon_color?: string;
  };
}

interface UseLeaguesOptions {
  leagueIds: string[];
  autoFetch?: boolean;
}

interface UseLeaguesResult {
  leagues: LeagueData[];
  loading: boolean;
  error: string | null;
  fetchLeagues: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useLeagues = ({
  leagueIds,
  autoFetch = true,
}: UseLeaguesOptions): UseLeaguesResult => {
  const [leagues, setLeagues] = useState<LeagueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    if (leagueIds.length === 0) {
      setLeagues([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const leaguesData = await Promise.all(
        leagueIds.map((leagueId) =>
          apiGet<any>(`/api/leagues/${leagueId}`)
        )
      );

      const leaguesWithData: LeagueData[] = leaguesData.map((league) => ({
        leagueId: league.id,
        leagueName: league.league_name,
        participants: league.participants,
        icon_style: league.icon_style,
      }));

      setLeagues(leaguesWithData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch leagues';
      setError(errorMessage);
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  }, [leagueIds]);

  useEffect(() => {
    if (autoFetch && leagueIds.length > 0) {
      fetchLeagues();
    }
  }, [autoFetch, fetchLeagues, leagueIds.length]);

  const refetch = useCallback(async () => {
    await fetchLeagues();
  }, [fetchLeagues]);

  return {
    leagues,
    loading,
    error,
    fetchLeagues,
    refetch,
  };
};
