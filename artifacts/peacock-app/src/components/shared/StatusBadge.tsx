import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-[#E8F5E9] text-[#2D7A4F]',
  upcoming: 'bg-[#E8F5E9] text-[#2D7A4F]',
  pending: 'bg-[#FDF5E0] text-[#8A6200]',
  cancelled: 'bg-[#FDECEA] text-[#C4382A]',
  completed: 'bg-warm-100 text-warm-500',
  'in-progress': 'bg-[#E6F1FB] text-[#2A6B8C]',
  'in progress': 'bg-[#E6F1FB] text-[#2A6B8C]',
  'quote-requested': 'bg-[#E6F1FB] text-[#2A6B8C]',
  'quote requested': 'bg-[#E6F1FB] text-[#2A6B8C]',
  'quote-ready': 'bg-[#FDF5E0] text-[#8A6200]',
  'quote ready': 'bg-[#FDF5E0] text-[#8A6200]',
  'quote-paid': 'bg-[#E8F5E9] text-[#2D7A4F]',
  'quote paid': 'bg-[#E8F5E9] text-[#2D7A4F]',
  new: 'bg-[#E6F1FB] text-[#185FA5]',
  reviewing: 'bg-[#FDF5E0] text-[#8A6200]',
  quoted: 'bg-[#EEEDFE] text-[#534AB7]',
  'awaiting-payment': 'bg-[#FDF5E0] text-[#8A6200]',
  'awaiting payment': 'bg-[#FDF5E0] text-[#8A6200]',
  paid: 'bg-[#E8F5E9] text-[#2D7A4F]',
  abandoned: 'bg-warm-100 text-warm-500',
  assigned: 'bg-[#E6F1FB] text-[#2A6B8C]',
  accepted: 'bg-[#FDF5E0] text-[#8A6200]',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status.toLowerCase()] || 'bg-warm-100 text-warm-600';
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-[11px] font-body font-medium capitalize', style, className)}>
      {label}
    </span>
  );
}
