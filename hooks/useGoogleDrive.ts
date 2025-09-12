/**
 * @file hooks/useGoogleDrive.ts
 * @description Custom hook for interacting with the Google Drive API.
 *
 * This hook manages authentication state, fetches file lists, and handles
 * loading and error states, abstracting the API logic away from the components.
 */

import { useState, useCallback, useEffect } from 'react';
import { ApiDriveFile } from '@/types/google-drive'; // Changed to ApiDriveFile

interface GoogleDriveState {
  files: ApiDriveFile[];
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

// Checks authentication status by calling the backend API.
const checkAuthStatus = useCallback(async () => {
  setState(prev => ({ ...prev, loading: true }));
  try {
    const res = await fetch('/api/google/auth/status');
    if (!res.ok) {
      throw new Error('Failed to check auth status');
    }
    const { isAuthenticated } = await res.json();
    setState(prev => ({ ...prev, isAuthenticated, loading: false }));
    return isAuthenticated;
  } catch (error) {
    console.error('checkAuthStatus error:', error);
    setState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
    return false;
  }
}, []);

  const login = useCallback(async (returnPath?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/google/auth?returnPath=${encodeURIComponent(returnPath || '/')}`);
      if (!res.ok) throw new Error('Failed to get authorization URL');
      const { authUrl } = await res.json();
      window.location.href = authUrl;
    } catch (e: unknown) {
      const error = e as Error;
      setError(error);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/files');
      if (!res.ok) {
        // If unauthorized, it might mean the cookie is stale.
        if (res.status === 401) {
          logout(); // Clear state if unauthorized
        }
        throw new Error('Failed to fetch files');
      }
      const { files } = await res.json();
      setState(prev => ({ ...prev, files, loading: false, error: null }));
    } catch (e: unknown) {
      const error = e as Error;
      setError(error);
    }
  }, []);

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

  return {
    ...state,
    login,
    logout,
    fetchFiles,
    checkAuthStatus,
  };
};
