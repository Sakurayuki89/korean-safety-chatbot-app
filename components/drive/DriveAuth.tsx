/**
 * @file components/drive/DriveAuth.tsx
 * @description Component to handle the Google Drive authentication process.
 *
 * This component displays a "Login with Google" button that, when clicked,
 * initiates the OAuth 2.0 flow using the `useGoogleDrive` hook.
 */

'use client';

import React from 'react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

interface DriveAuthProps {
  onAuthSuccess: () => void; // Callback to notify parent component of successful auth
}

const DriveAuth: React.FC<DriveAuthProps> = ({ onAuthSuccess }) => {
  const { login, loading, error, isAuthenticated } = useGoogleDrive();

  // This effect will be part of a more complete solution to check session status
  // and call onAuthSuccess when isAuthenticated becomes true.
  React.useEffect(() => {
    if (isAuthenticated) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  if (isAuthenticated) {
    return <p>You are authenticated with Google Drive.</p>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Connect to Google Drive</h2>
      <p>Please log in to access your PDF files from Google Drive.</p>
      <button onClick={() => login(window.location.pathname)} disabled={loading} style={{ marginTop: '10px', padding: '10px 20px' }}>
        {loading ? 'Redirecting...' : 'Login with Google'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error.message}</p>}
    </div>
  );
};

export default DriveAuth;
