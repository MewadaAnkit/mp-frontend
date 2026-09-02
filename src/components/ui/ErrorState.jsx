import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while retrieving data. Please try again.',
  onRetry,
  retryLabel = 'Try Again'
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 my-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 ring-8 ring-rose-500/5">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="app-btn-secondary text-xs border-slate-300 dark:border-slate-700"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
