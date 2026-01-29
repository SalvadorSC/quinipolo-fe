import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { apiPost } from '../../utils/apiUtils';
import { calculateAge } from '../../utils/calculateAge';

interface SignupData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  birthday: string;
}

interface SignupResult {
  success: boolean;
  error?: string;
}

export const useSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signup = async (data: SignupData): Promise<SignupResult> => {
    setLoading(true);
    setError(null);

    const { email, password, username, fullName, birthday } = data;

    // Calculate age from birthday
    const age = calculateAge(birthday);

    try {
      // Sign up with Supabase auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullName,
            birthday,
            isUserOver18: age >= 18,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return { success: false, error: authError.message };
      }

      // Then call backend API to create profile and add to leagues
      try {
        await apiPost('/api/auth/signup', {
          email,
          username,
          fullName,
          birthday,
          isUserOver18: age >= 18,
          leagues: ['global'],
          userId: authData.user?.id,
        });
      } catch (backendError: any) {
        // Handle backend validation errors
        if (backendError?.response?.data?.error) {
          const errorMessage = backendError.response.data.error;
          if (
            errorMessage.includes('quinipolo') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('restricted words')
          ) {
            setError(errorMessage);
            setLoading(false);
            return { success: false, error: errorMessage };
          }
        }
        console.warn(
          'Backend signup failed, but auth was successful:',
          backendError
        );
        // Don't fail the signup if backend call fails, as the profile will be created when user first accesses it
      }

      setLoading(false);
      navigate('/email-confirmation');
      return { success: true };
    } catch (err: any) {
      // Handle backend validation errors
      if (err?.response?.data?.error) {
        const errorMessage = err.response.data.error;
        if (
          errorMessage.includes('quinipolo') ||
          errorMessage.includes('already exists')
        ) {
          setError(errorMessage);
          setLoading(false);
          return { success: false, error: errorMessage };
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError(null);

  return {
    signup,
    loading,
    error,
    clearError,
  };
};
