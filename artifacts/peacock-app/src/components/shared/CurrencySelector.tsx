import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  variant?: 'light' | 'dark';
}

export function CurrencySelector({ variant = 'light' }: CurrencySelectorProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-pill text-sm font-body font-medium transition-colors',
          variant === 'dark'
            ? 'text-white/90 hover:bg-white/10'
            : 'text-warm-600 hover:bg-warm-50'
        )}
      >
        <span className="text-base">{currency.flag}</span>
        <span>{currency.code}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-modal border border-warm-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body hover:bg-warm-50 transition-colors',
                c.code === currency.code ? 'bg-forest-50 text-forest-600 font-medium' : 'text-warm-600'
              )}
            >
              <span className="text-lg">{c.flag}</span>
              <span>{c.code}</span>
              <span className="text-warm-400 text-xs ml-auto">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
