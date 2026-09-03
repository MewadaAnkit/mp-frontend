import React from 'react';

export default function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'emerald',
  onClick
}) {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700'
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20',
      hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-700'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700'
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20',
      hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700'
    },
    cyan: {
      iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20',
      hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        scheme.hoverBorder
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105 duration-200 ${scheme.iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                trend > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          <span className="truncate">{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
}
