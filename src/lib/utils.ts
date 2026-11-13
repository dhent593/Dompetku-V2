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

