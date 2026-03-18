import React, { createContext, useContext, useState, useEffect } from 'react';
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

const STORAGE_KEY = 'peacock_currency';
const BASE_CURRENCIES: Currency[] = currenciesData as Currency[];

const CurrencyContext = createContext<CurrencyContextType | null>(null);

function getSavedCurrency(): Currency | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const code = JSON.parse(saved) as string;
    return BASE_CURRENCIES.find(c => c.code === code) ?? null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>(BASE_CURRENCIES);
  const [currency, setCurrencyState] = useState<Currency>(
    getSavedCurrency() ?? BASE_CURRENCIES[0]
  );

  // Fetch live exchange rates from API on mount
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
    fetch(`${apiBase}/currencies/rates`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Record<string, number> | null) => {
        if (!data) return;
        // data = { GBP: 1, USD: 1.27, EUR: 1.17, ... }
        setCurrencies(prev =>
          prev.map(c => ({ ...c, rate: data[c.code] ?? c.rate }))
        );
        // Update current currency rate in place
        setCurrencyState(prev => ({
          ...prev,
          rate: data[prev.code] ?? prev.rate,
        }));
      })
      .catch(() => { /* use hardcoded fallback rates */ });
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c.code));
  };

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
