/**
 * components/LoadingSpinner.js - Reusable loading states
 */

import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <svg
      className={`animate-spin text-primary-500 ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading...</p>
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5 animate-pulse">
    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.07 16.5C3.3 17.333 4.26 19 5.8 19z" />
      </svg>
    </div>
    <div>
      <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">Something went wrong</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">{message || 'Failed to load data. Please try again.'}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary text-sm">
        Try Again
      </button>
    )}
  </div>
);

export default LoadingSpinner;
