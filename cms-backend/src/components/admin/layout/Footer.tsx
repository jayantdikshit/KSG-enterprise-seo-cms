"use client";
import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center">
      <span>© 2024 Your Company. All rights reserved.</span>
      <button
        onClick={toggleTheme}
        className="ml-4 text-indigo-600 hover:underline"
      >
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </footer>
  );
}
