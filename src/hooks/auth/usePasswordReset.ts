import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getRedirectUrl } from '../../utils/config';

interface PasswordResetResult {
  success: boolean;
  error?: string;
}

export const usePasswordReset = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // Manage cooldown timer
  useEffect(() => {
    if (cooldownTimer > 0) {
      const interval = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cooldownTimer]);

  const requestPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    if (!email) {
      const errorMessage = 'Please enter your email address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return { success: false, error: resetError.message };
      }

      // Show success modal and start cooldown
      setShowSuccessModal(true);
      setCooldownTimer(120); // 2 minutes cooldown
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const clearError = () => setError(null);

  const formatCooldownTime = () => {
    const minutes = Math.floor(cooldownTimer / 60);
    const seconds = (cooldownTimer % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return {
    requestPasswordReset,
    loading,
    error,
    clearError,
    showSuccessModal,
    closeSuccessModal,
    cooldownTimer,
    formatCooldownTime,
    canSendReset: cooldownTimer === 0,
  };
};
