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

/**
 * Returns local YYYY-MM-DD string without UTC offset issues
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a transaction date string (YYYY-MM-DD) into readable localized format
 * Example: "2026-11-19" -> "19 Nov 2026" (ID) or "Nov 19, 2026" (EN)
 */
export function formatTxDate(dateStr: string, language: 'id' | 'en' = 'id'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return dateStr;
}

/**
 * Formats full transaction date & time for clean card display
 * Example: "19 Nov 2026, 09:50 AM"
 */
export function formatTxDateTime(dateStr: string, timeStr?: string, language: 'id' | 'en' = 'id'): string {
  const formattedDate = formatTxDate(dateStr, language);
  if (!formattedDate) return timeStr || '';
  if (!timeStr) return formattedDate;
  return `${formattedDate}, ${timeStr}`;
}

/**
 * Dynamically computes date group based on current local date vs tx.date
 * Returns: 'TODAY' | 'YESTERDAY' | 'EARLIER THIS WEEK' | 'OLDER'
 */
export function computeTxDateGroup(dateStr: string): 'TODAY' | 'YESTERDAY' | 'EARLIER THIS WEEK' | 'OLDER' {
  if (!dateStr) return 'OLDER';
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (dateStr === todayStr) return 'TODAY';
  if (dateStr === yesterdayStr) return 'YESTERDAY';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const txDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = todayDate.getTime() - txDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1 && diffDays <= 7) {
      return 'EARLIER THIS WEEK';
    }
  }

  return 'OLDER';
}

