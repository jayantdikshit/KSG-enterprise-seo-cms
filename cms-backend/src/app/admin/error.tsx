
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ error }: { error?: Error }) {
  // You could log the error or display a nicer UI
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4">
      <h1 className="text-3xl font-bold text-red-800">Oops! Something went wrong.</h1>
      {error && (
        <pre className="mt-4 max-w-2xl overflow-x-auto rounded bg-white p-4 text-sm text-gray-800">
          {error.message}
        </pre>
      )}
      <button
        onClick={() => router.replace('/')}
        className="mt-6 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Go Home
      </button>
    </div>
  );
}
