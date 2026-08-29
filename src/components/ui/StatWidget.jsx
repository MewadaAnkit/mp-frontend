import React from 'react';

export default function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  onClick
}) {
  const colorMap = {
    blue: {
      bg: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/25',
      glow: 'group-hover:border-blue-500/50'
    },
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/25',
      glow: 'group-hover:border-emerald-500/50'
    },
    amber: {
      bg: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-600 text-white shadow-amber-500/25',
      glow: 'group-hover:border-amber-500/50'
    },
    purple: {
      bg: 'from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-600 text-white shadow-purple-500/25',
      glow: 'group-hover:border-purple-500/50'
    },
    rose: {
      bg: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-600 text-white shadow-rose-500/25',
      glow: 'group-hover:border-rose-500/50'
    },
    cyan: {
      bg: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-600 text-white shadow-cyan-500/25',
      glow: 'group-hover:border-cyan-500/50'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-[#111827] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        scheme.glow
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${scheme.iconBg}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {trend && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                trend > 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          <span>{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
}
