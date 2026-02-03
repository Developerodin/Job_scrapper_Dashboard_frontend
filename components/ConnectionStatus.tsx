'use client';

import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://demo-addon-apis.theodin.in/job';
        const response = await fetch(`${API_URL}/health`);
        setIsConnected(response.ok);
      } catch (error) {
        console.error('Backend connection check failed:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">Checking backend connection...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">Backend Not Connected</p>
            <p className="text-xs text-red-700 mt-1">
              Make sure the backend server is running on port 3001
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-green-800 font-medium">Backend Connected</p>
      </div>
    </div>
  );
}
