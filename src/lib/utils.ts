import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, prefix: string = 'Rp'): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = Math.abs(rounded).toLocaleString('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${prefix}${formatted}`;
}

export function formatCardNumber(mask: string): string {
  return mask;
}

/**
 * Formats a raw numeric string or number with Indonesian thousand dots (.)
 * Example: "1000" -> "1.000", "1000000" -> "1.000.000"
 */
export function formatNumberInput(value: string | number | undefined | null): string {
  if (value === '' || value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}

/**
 * Parses a dot-separated string into a clean numeric number
 * Example: "1.000.000" -> 1000000
 */
export function parseNumberInput(value: string | number | undefined | null): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const digits = String(value).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

