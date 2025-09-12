/**
 * @file hooks/useGoogleDrive.ts
 * @description Custom hook for interacting with the Google Drive API.
 *
 * This hook manages authentication state, fetches file lists, and handles
 * loading and error states, abstracting the API logic away from the components.
 */

import { useState, useCallback, useEffect } from 'react';
import { ApiDriveFile } from '@/types/google-drive';

interface GoogleDriveState {
  files: ApiDriveFile[];
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

export const useGoogleDrive = () => {
  const [state, setState] = useState<GoogleDriveState>({
    files: [],
    loading: false,
    error: null,
    isAuthenticated: false,
  });

  // Helper functions to update individual state properties
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Checks authentication status by calling the backend API
  const checkAuthStatus = useCallback(async () => {
    console.log('[useGoogleDrive] Checking auth status...');
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/google/auth/status');
      console.log('[useGoogleDrive] Auth status response:', res.status, res.ok);
      if (!res.ok) {
        throw new Error(`Failed to check auth status: ${res.status}`);
      }
      const responseData = await res.json();
      console.log('[useGoogleDrive] Auth status data:', responseData);
      const { isAuthenticated } = responseData;
      setState(prev => ({ ...prev, isAuthenticated, loading: false }));
      console.log('[useGoogleDrive] Auth status updated:', isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.error('[useGoogleDrive] checkAuthStatus error:', error);
      setState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
      return false;
    }
  }, []);

  const login = useCallback(async (returnPath?: string) => {
    console.log('[useGoogleDrive] Starting login process, returnPath:', returnPath);
    setLoading(true);
    try {
      const authUrl = `/api/google/auth?returnPath=${encodeURIComponent(returnPath || '/')}`;
      console.log('[useGoogleDrive] Fetching auth URL from:', authUrl);
      const res = await fetch(authUrl);
      console.log('[useGoogleDrive] Auth URL response:', res.status, res.ok);
      if (!res.ok) throw new Error(`Failed to get authorization URL: ${res.status}`);
      const responseData = await res.json();
      console.log('[useGoogleDrive] Auth URL data:', responseData);
      const { authUrl: googleAuthUrl } = responseData;
      console.log('[useGoogleDrive] Redirecting to Google:', googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (e: unknown) {
      const error = e as Error;
      console.error('[useGoogleDrive] Login error:', error);
      setError(error);
    }
  }, [setLoading, setError]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/files');
      if (!res.ok) {
        // If unauthorized, it might mean the cookie is stale.
        if (res.status === 401) {
          setState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
        }
        throw new Error('Failed to fetch files');
      }
      const { files } = await res.json();
      setState(prev => ({ ...prev, files, loading: false, error: null }));
    } catch (e: unknown) {
      const error = e as Error;
      setError(error);
    }
  }, [setLoading, setError]);

  const logout = useCallback(() => {
    // Clear the cookie by setting its expiry date to the past
    if (typeof window !== 'undefined') {
      document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    setState({
      files: [],
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    console.log('User logged out, cookie cleared');
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...state,
    login,
    logout,
    fetchFiles,
    checkAuthStatus,
  };
};
