"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error?: Error, reset?: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-black/5 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h1>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          We're sorry, but an unexpected error occurred while processing your request.
        </p>

        {error && (
          <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs text-left p-4 rounded-lg overflow-x-auto mb-6">
            <code className="font-mono">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {reset && (
            <button
              onClick={() => reset()}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
