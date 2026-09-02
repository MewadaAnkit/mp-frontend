import React from 'react';

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-slate-200 dark:bg-slate-800 rounded-md ${
                j === 0 ? 'w-1/4' : j === 1 ? 'w-1/3' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-1/2" />
          <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-md w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 w-1/2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-slate-200 dark:bg-slate-800 h-44 rounded-2xl p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-300 dark:bg-slate-700 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl md:col-span-2" />
      </div>
    </div>
  );
}

export default { TableSkeleton, CardSkeleton, ListSkeleton, ProfileSkeleton };

