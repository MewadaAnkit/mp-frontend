import React from 'react';

export default function FormField({
  label,
  required = false,
  error,
  helper,
  children,
  className = '',
  id
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          <span className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </span>
        </label>
      )}

      {children}

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
