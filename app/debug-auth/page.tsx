'use client';

import { useState, useEffect } from 'react';

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string>('');

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google/auth/status');
      const data = await response.json();
      setAuthStatus({ status: response.status, ok: response.ok, data });
    } catch (error) {
      setAuthStatus({ error: error.message });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/google/auth?returnPath=/debug-auth');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  const clearCookies = () => {
    document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'google_oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload();
  };

  useEffect(() => {
    checkAuthStatus();
    setCookies(document.cookie);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current URL:</h2>
        <p>{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Browser Cookies:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', wordBreak: 'break-all' }}>
          {cookies || 'No cookies found'}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Status API Response:</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        )}
        <button onClick={checkAuthStatus} style={{ margin: '10px 0' }}>
          Refresh Auth Status
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Actions:</h2>
        <button onClick={testLogin} style={{ margin: '5px' }}>
          Test Login Flow
        </button>
        <button onClick={clearCookies} style={{ margin: '5px' }}>
          Clear All Cookies
        </button>
        <button onClick={() => window.location.href = '/admin'} style={{ margin: '5px' }}>
          Go to Admin Page
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Info:</h2>
        <p>Current Domain: {typeof window !== 'undefined' ? window.location.host : 'N/A'}</p>
        <p>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
      </div>
    </div>
  );
}