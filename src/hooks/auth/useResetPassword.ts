import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export const useResetPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);

  // Check if we have a valid reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Supabase automatically parses hash fragments and sets the session
        // when the page loads from a password reset link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsValidLink(false);
          return;
        }

        // Check if this is a password recovery session
        // In a valid reset flow, we should have a session
        if (!session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsValidLink(false);
        } else {
          setIsValidLink(true);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('An error occurred. Please try again.');
        setIsValidLink(false);
      }
    };

    checkSession();
  }, []);

  const resetPassword = async (newPassword: string): Promise<ResetPasswordResult> => {
    if (!isValidLink) {
      const errorMessage = 'Invalid or expired reset link';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return { success: false, error: updateError.message };
      }

      setSuccess(true);

      // Sign out the user after successful password reset
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while resetting your password';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError(null);

  return {
    resetPassword,
    loading,
    error,
    clearError,
    success,
    isValidLink,
  };
};
