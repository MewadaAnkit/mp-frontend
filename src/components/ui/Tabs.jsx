import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-850 dark:bg-[#0e1524] rounded-xl border border-slate-200/70 dark:border-slate-800/80 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/30'
                    : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
