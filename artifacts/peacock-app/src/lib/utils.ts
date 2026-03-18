import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "GBP"): string {
  // Mock conversion rates
  const rates: Record<string, number> = {
    GBP: 1,
    USD: 1.27,
    EUR: 1.17,
    AUD: 1.96,
    LKR: 378.50
  };
  
  const converted = amount * (rates[currency] || 1);
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'LKR' ? 0 : 2
  }).format(converted);
}

// Parses a string like "Explore Sri Lanka your *way*" into a React node array
export function parseHeadingParts(text: string): Array<{ text: string; italic: boolean }> {
  if (!text.includes('*')) return [{ text, italic: false }];
  
  const parts = text.split('*');
  return parts.map((part, i) => ({
    text: part,
    italic: i % 2 === 1,
  })).filter(p => p.text.length > 0);
}
