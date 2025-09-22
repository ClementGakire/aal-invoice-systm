import React, { useState } from 'react';
import {
  isUsingFallback,
  resetApiAvailability,
  testApiConnection,
} from '../services/api';

export default function ApiConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testApiConnection();
    setLastTestResult(result);
    setTesting(false);

    // Force a page reload to update all components
    if (result) {
      window.location.reload();
    }
  };

  if (!isUsingFallback()) {
    return null; // Don't show if API is working
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">API Connection</h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Using Mock Data
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Connect to your Vercel Postgres database to use real data.
      </p>

      <button
        onClick={handleTestConnection}
        disabled={testing}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {testing ? 'Testing...' : 'Test API Connection'}
      </button>

      {lastTestResult !== null && (
        <div
          className={`mt-2 text-xs ${
            lastTestResult ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {lastTestResult ? '✅ Connected!' : '❌ Still offline'}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Set up database →
        </a>
      </div>
    </div>
  );
}
