import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyMap: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  HKD: "¥",
  NZD: "NZ$",
};

export function getCurrencySymbol(currencyCode: string | undefined | null): string {
  if (!currencyCode) return "$";
  return currencyMap[currencyCode] || currencyCode; // Fallback to code if symbol not found (e.g. 'SEK') or return symbol
}