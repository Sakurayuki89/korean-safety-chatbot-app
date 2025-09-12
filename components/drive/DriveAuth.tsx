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

  // Debug logging
  React.useEffect(() => {
    console.log('[DriveAuth] State changed:', { isAuthenticated, loading, error });
  }, [isAuthenticated, loading, error]);

  // This effect will be part of a more complete solution to check session status
  // and call onAuthSuccess when isAuthenticated becomes true.
  React.useEffect(() => {
    console.log('[DriveAuth] isAuthenticated changed:', isAuthenticated);
    if (isAuthenticated) {
      console.log('[DriveAuth] Calling onAuthSuccess');
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  if (isAuthenticated) {
    return <p>You are authenticated with Google Drive.</p>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h2>Connect to Google Drive</h2>
      <p>Please log in to access your PDF files from Google Drive.</p>
      <button onClick={() => {
        console.log('[DriveAuth] Login button clicked, current path:', window.location.pathname);
        login(window.location.pathname);
      }} disabled={loading} style={{ marginTop: '10px', padding: '10px 20px' }}>
        {loading ? 'Redirecting...' : 'Login with Google'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error.message}</p>}
      
      {/* Debug Information */}
      <div style={{ marginTop: '30px', textAlign: 'left', background: '#333', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
        <h3>🐛 Debug Information</h3>
        <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        <p><strong>Cookies:</strong> {typeof window !== 'undefined' ? (document.cookie || 'No cookies') : 'Loading...'}</p>
        <p><strong>Auth State:</strong> {JSON.stringify({ isAuthenticated, loading, hasError: !!error })}</p>
        <p><strong>Environment:</strong> {typeof window !== 'undefined' ? window.location.host : 'Loading...'}</p>
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/google/auth/status');
              const data = await res.json();
              alert(`Auth Status: ${JSON.stringify(data, null, 2)}`);
            } catch (err) {
              alert(`Error checking status: ${(err as Error).message}`);
            }
          }} 
          style={{ margin: '10px 5px 0 0', padding: '5px 10px', fontSize: '10px' }}
        >
          Test Auth Status
        </button>
        <button 
          onClick={() => {
            document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.reload();
          }} 
          style={{ margin: '10px 0 0 0', padding: '5px 10px', fontSize: '10px' }}
        >
          Clear Cookies & Reload
        </button>
      </div>
    </div>
  );
};

export default DriveAuth;
