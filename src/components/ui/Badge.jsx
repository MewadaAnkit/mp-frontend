import React from 'react';

export function StatusBadge({ status, size = 'sm', pulse = false, className = '' }) {
  const norm = String(status || '').toUpperCase();

  let variant = 'neutral';
  let label = status || 'N/A';

  switch (norm) {
    case 'ACTIVE':
    case 'PRESENT':
    case 'PAID':
    case 'PUBLISHED':
    case 'APPROVED':
    case 'PASSED':
    case 'PASS':
    case 'PROMOTED':
    case 'COMPLETED':
    case 'ENROLLED':
    case 'SUCCESS':
      variant = 'success';
      break;

    case 'PENDING':
    case 'IN_REVIEW':
    case 'HALF_DAY':
    case 'LATE':
    case 'DRAFT':
    case 'UPCOMING':
    case 'PARTIAL':
    case 'PROCESSING':
    case 'INQUIRY':
      variant = 'warning';
      break;

    case 'INACTIVE':
    case 'ABSENT':
    case 'OVERDUE':
    case 'UNPAID':
    case 'REJECTED':
    case 'FAILED':
    case 'FAIL':
    case 'DETAINED':
    case 'CANCELLED':
    case 'SUPPLEMENTARY':
    case 'WITHHELD':
      variant = 'danger';
      break;

    case 'SCHEDULED':
    case 'ONGOING':
    case 'EVALUATING':
    case 'APPLICATION':
    case 'INFO':
      variant = 'info';
      break;

    case 'VERIFIED':
    case 'SPECIAL':
    case 'HONOR':
      variant = 'purple';
      break;

    default:
      variant = 'neutral';
      break;
  }

  return (
    <Badge variant={variant} size={size} pulse={pulse} className={className}>
      {label}
    </Badge>
  );
}

export default function Badge({ children, variant = 'info', pulse = false, size = 'sm', className = '' }) {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    neutral: 'bg-slate-400'
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.8 text-xs',
    md: 'px-3 py-1.2 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border ${
        variantStyles[variant] || variantStyles.info
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              dotColors[variant] || 'bg-blue-400'
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dotColors[variant] || 'bg-blue-500'
            }`}
          ></span>
        </span>
      )}
      {children}
    </span>
  );
}

