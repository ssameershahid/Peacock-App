import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface LineItem {
  label: string;
  amount: number;
  note?: string;
}

interface PriceSummaryProps {
  items: LineItem[];
  addOns?: LineItem[];
  surcharge?: { label: string; multiplier: number };
  className?: string;
}

export function PriceSummary({ items, addOns, surcharge, className }: PriceSummaryProps) {
  const { format, currency } = useCurrency();

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const addOnsTotal = addOns?.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const preTotal = subtotal + addOnsTotal;
  const surchargeAmount = surcharge ? preTotal * (surcharge.multiplier - 1) : 0;
  const total = preTotal + surchargeAmount;

  return (
    <div className={cn('bg-white rounded-2xl border border-warm-100 p-6', className)}>
      <h4 className="font-body font-bold text-forest-600 mb-4">Price Summary</h4>

      <div className="space-y-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between font-body text-sm">
            <span className="text-warm-600">{item.label}{item.note && <span className="text-warm-400 text-xs ml-1">({item.note})</span>}</span>
            <span className="text-forest-600 font-medium">{format(item.amount)}</span>
          </div>
        ))}
      </div>

      {addOns && addOns.length > 0 && (
        <>
          <div className="border-t border-warm-100 pt-3 mt-3 space-y-3">
            <span className="font-body text-xs text-warm-400 uppercase tracking-wider">Add-ons</span>
            {addOns.map((item, i) => (
              <div key={i} className="flex justify-between font-body text-sm">
                <span className="text-warm-600">{item.label}</span>
                <span className="text-forest-600 font-medium">{format(item.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {surcharge && (
        <div className="flex justify-between font-body text-sm border-t border-warm-100 pt-3 mt-3">
          <span className="text-amber-500 font-medium">{surcharge.label}</span>
          <span className="text-amber-500 font-medium">+{format(surchargeAmount)}</span>
        </div>
      )}

      <div className="border-t-2 border-forest-500 pt-4 mt-4 flex justify-between items-end">
        <span className="font-body font-bold text-forest-600">Total</span>
        <div className="text-right">
          <span className="font-display text-3xl text-forest-600">{format(total)}</span>
          {currency.code !== 'GBP' && (
            <p className="font-body text-xs text-warm-400 mt-0.5">
              ≈ £{Math.round(total / currency.rate).toLocaleString()} GBP
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
