import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs = [],
  actions = null,
  badge = null,
  stats = null
}) {
  return (
    <div className="mb-6 space-y-3">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Dashboard
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Quick Stats Bar */}
      {stats && (
        <div className="pt-2 flex items-center gap-4 flex-wrap border-t border-slate-100 dark:border-slate-800/80">
          {stats}
        </div>
      )}
    </div>
  );
}
