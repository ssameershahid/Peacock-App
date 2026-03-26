import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function KPICard({ icon, label, value, trend, className }: KPICardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-warm-100 p-5 shadow-none', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-forest-50 flex items-center justify-center text-forest-500">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-body font-medium',
            trend.positive ? 'bg-[#E8F5E9] text-[#2D7A4F]' : 'bg-[#FDECEA] text-[#C4382A]'
          )}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <p className="font-body text-sm text-warm-400 mb-1">{label}</p>
      <p className="font-display font-normal text-3xl text-warm-900">{value}</p>
    </div>
  );
}
