import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { suggestedCurrencyCodeFromCountry } from '@/lib/geoCurrency';

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
const BASE_CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'United Kingdom', rate: 1 },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'United States', rate: 1.27 },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Europe', rate: 1.17 },
  { code: 'CAD', symbol: 'CA$', flag: '🇨🇦', name: 'Canada', rate: 1.71 },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺', name: 'Australia', rate: 1.95 },
  { code: 'LKR', symbol: 'Rs', flag: '🇱🇰', name: 'Sri Lanka', rate: 380 },
];

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
  const geoHintApplied = useRef(false);
  const currenciesRef = useRef(currencies);
  currenciesRef.current = currencies;

  // First visit only (no saved currency): rough currency from Vercel geo — production + same-origin /api/geo only
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (geoHintApplied.current) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { country: string | null }) => {
        const code = suggestedCurrencyCodeFromCountry(data.country);
        if (!code) return;
        const match =
          currenciesRef.current.find((c) => c.code === code) ??
          BASE_CURRENCIES.find((c) => c.code === code);
        if (!match) return;
        geoHintApplied.current = true;
        setCurrencyState(match);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(code));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* dev / no Vercel headers / offline */
      });
  }, []);

  // Fetch live exchange rates from API on mount
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
    fetch(`${apiBase}/currencies`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { rates: Record<string, number> } | null) => {
        if (!data?.rates) return;
        const rates = data.rates;
        // rates = { GBP: 1, USD: 1.27, EUR: 1.17, ... }
        setCurrencies(prev =>
          prev.map(c => ({ ...c, rate: rates[c.code] ?? c.rate }))
        );
        // Update current currency rate in place
        setCurrencyState(prev => ({
          ...prev,
          rate: rates[prev.code] ?? prev.rate,
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
