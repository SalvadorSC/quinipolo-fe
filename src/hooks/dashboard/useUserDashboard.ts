import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiUtils';
import { UserDataType } from '../../Context/UserContext/UserContext';

interface UseUserDashboardResult {
  loading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  hasFetchedProfile: boolean;
}

export const useUserDashboard = (
  userData: UserDataType,
  updateUser: (data: Partial<UserDataType>) => void
): UseUserDashboardResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (hasFetchedProfile || !userData.isAuthenticated) {
      return;
    }

    // Only fetch if we don't have leagues yet
    if (userData.leagues && userData.leagues.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await apiGet<UserDataType>('/api/users/me/profile');

      const leagues = profile.leagues || [];
      // Sort leagues with "global" first
      leagues.sort((a, b) =>
        a.leagueId === 'global' ? -1 : b.leagueId === 'global' ? 1 : 0
      );

      updateUser({
        leagues,
        role: profile.role,
        username: profile.username,
      });

      setHasFetchedProfile(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch user profile';
      setError(errorMessage);
      console.error('Error fetching user profile:', err);

      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        window.location.href = '/sign-in';
      }
    } finally {
      setLoading(false);
    }
  }, [userData.isAuthenticated, userData.leagues, updateUser, hasFetchedProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    loading,
    error,
    fetchUserProfile,
    hasFetchedProfile,
  };
};
