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
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>✅ You are authenticated with Google Drive.</p>
        <p>Loading admin dashboard...</p>
      </div>
    );
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
      
      {/* Simplified Debug Information */}
      <details style={{ marginTop: '30px', textAlign: 'left', background: '#333', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>🐛 Debug Information (Click to expand)</summary>
        <p><strong>Environment:</strong> {typeof window !== 'undefined' ? window.location.host : 'Loading...'}</p>
        <p><strong>Auth State:</strong> {JSON.stringify({ isAuthenticated, loading, hasError: !!error })}</p>
        <div style={{ marginTop: '10px', padding: '10px', background: '#444', borderRadius: '3px' }}>
          <h4>Google Cloud Console 설정</h4>
          <p>리디렉션 URI:</p>
          <code style={{ display: 'block', margin: '5px 0', padding: '5px', background: '#555', fontSize: '10px', wordBreak: 'break-all' }}>
            {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api/google/auth/callback` : 'Loading...'}
          </code>
        </div>
        <button 
          onClick={() => {
            document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.reload();
          }} 
          style={{ margin: '10px 0 0 0', padding: '5px 10px', fontSize: '10px' }}
        >
          Clear Session & Reload
        </button>
      </details>
    </div>
  );
};

export default DriveAuth;
