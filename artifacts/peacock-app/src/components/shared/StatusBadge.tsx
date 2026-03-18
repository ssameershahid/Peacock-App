import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-warm-100 text-warm-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'in progress': 'bg-blue-100 text-blue-700',
  'quote-paid': 'bg-blue-100 text-blue-700',
  'quote paid': 'bg-blue-100 text-blue-700',
  new: 'bg-blue-100 text-blue-700',
  quoted: 'bg-amber-100 text-amber-700',
  abandoned: 'bg-warm-100 text-warm-500',
  assigned: 'bg-blue-100 text-blue-700',
  accepted: 'bg-amber-100 text-amber-700',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status.toLowerCase()] || 'bg-warm-100 text-warm-600';
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-pill text-xs font-body font-medium capitalize', style, className)}>
      {label}
    </span>
  );
}
