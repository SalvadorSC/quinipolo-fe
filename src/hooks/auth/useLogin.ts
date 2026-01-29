import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '../../Context/UserContext/UserContext';
import { getRedirectUrl } from '../../utils/config';
import { trackLogin } from '../../utils/analytics';
import { apiPost } from '../../utils/apiUtils';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUser();

  const login = async (
    credentials: LoginCredentials,
    returnUrl?: string | null
  ): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      // Store auth data
      localStorage.setItem('userId', data?.user?.id ?? '');
      localStorage.setItem('username', data?.user?.email ?? '');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', data?.session?.access_token ?? '');

      // Update user context
      updateUser({
        userId: data?.user?.id ?? '',
        username: data?.user?.email ?? '',
        token: data?.session?.access_token ?? '',
        isAuthenticated: true,
      });

      trackLogin('password');

      // Handle pending share token (user came from a join link)
      try {
        const pendingShareToken = localStorage.getItem('pendingShareToken');
        if (pendingShareToken && data?.user?.id) {
          const joinResponse = (await apiPost<{ league?: { id: string } }>(
            `/api/leagues/join-by-link/${pendingShareToken}`,
            {
              userId: data.user.id,
              username: data.user.email ?? '',
            }
          )) as any;

          // Clear the token once attempted
          localStorage.removeItem('pendingShareToken');

          // If join succeeded and a league was returned, go straight to the league
          const leagueId = joinResponse?.league?.id;
          if (leagueId) {
            navigate(`/league-dashboard?id=${leagueId}`);
            setLoading(false);
            return { success: true };
          }
        }
      } catch (e) {
        // Ignore errors (expired/invalid/already in league), continue normal navigation
        localStorage.removeItem('pendingShareToken');
      }

      // Redirect to returnUrl if provided, otherwise go to home
      navigate(returnUrl || '/');
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (returnUrl?: string | null): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(returnUrl || '/'),
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    loginWithGoogle,
    loading,
    error,
    clearError,
  };
};
