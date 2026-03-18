import React, { createContext, useContext, useState } from 'react';
import currenciesData from '@/data/currencies.json';

export type Currency = {
  code: string;
  symbol: string;
  flag: string;
  name: string;
  rate: number;
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencies: Currency[];
  convert: (gbpAmount: number) => number;
  format: (gbpAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currencies = currenciesData as Currency[];
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const convert = (gbpAmount: number) => gbpAmount * currency.rate;

  const format = (gbpAmount: number) => {
    const converted = convert(gbpAmount);
    if (currency.code === 'LKR') {
      return `${currency.symbol} ${Math.round(converted).toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
