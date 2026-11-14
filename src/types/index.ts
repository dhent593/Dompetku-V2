export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  category: 'shopping' | 'bill' | 'salary' | 'travel' | 'investment' | 'food' | 'entertainment' | 'transfer' | 'other';
  amount: number;
  type: TransactionType;
  date: string; // ISO date string (YYYY-MM-DD)
  dateGroup: 'TODAY' | 'YESTERDAY' | string;
  time: string; // e.g. "01:15 PM"
  timestamp: number;
  iconName?: string;
  cardNumber?: string;
  recipient?: string;
  note?: string;
}

export interface PaymentCard {
  id: string;
  cardHolder: string;
  cardNumberMask: string; // e.g. ".... 3245"
  cardExpiry: string; // e.g. "08/30"
  brand: 'visa' | 'mastercard' | 'amex';
  isDefault: boolean;
  colorGradient?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  cardNumberMask: string; // ".... 3245"
  cardExpiry: string; // "08/30"
  balance: number;
  totalBalance: number;
  isOnline: boolean;
  biometricEnabled: boolean;
  mPinHash: string; // simulated hash (default PIN: "1234")
}

export interface CategorySummary {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color?: string;
}

export type NavTab = 'home' | 'analytics' | 'wallet' | 'settings' | 'transactions';

export type TimeFilter = 'monthly' | 'weekly' | 'yearly';
export type AnalyticType = 'expenses' | 'savings';

export interface Pocket {
  id: string;
  name: string;
  balance: number;
  targetAmount: number;
  color: string;
  iconName: string;
  createdAt: number;
}
