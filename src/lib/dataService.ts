import { Transaction, UserProfile, CategorySummary } from '@/types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, CATEGORY_SUMMARIES } from './dummyData';

const STORAGE_KEYS = {
  USER: 'mypocket_user_v1',
  TRANSACTIONS: 'mypocket_transactions_v1',
  CATEGORIES: 'mypocket_categories_v1',
  IS_LOCKED: 'mypocket_is_locked_v1',
};

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- User Profile ---
  getUser(): UserProfile {
    if (!this.isBrowser()) return INITIAL_USER;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load user profile from storage', e);
    }
    return INITIAL_USER;
  }

  saveUser(user: UserProfile): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }

  // --- Transactions ---
  getTransactions(): Transaction[] {
    if (!this.isBrowser()) return INITIAL_TRANSACTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load transactions from storage', e);
    }
    return INITIAL_TRANSACTIONS;
  }

  saveTransactions(transactions: Transaction[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  addTransaction(newTx: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const transactions = this.getTransactions();
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    const updated = [created, ...transactions];
    this.saveTransactions(updated);

    // Update user balance
    const user = this.getUser();
    const balanceDelta = created.type === 'income' ? created.amount : -created.amount;
    user.balance = Math.max(0, user.balance + balanceDelta);
    user.totalBalance = Math.max(0, user.totalBalance + balanceDelta);
    this.saveUser(user);

    return created;
  }

  // --- Lock / Security State ---
  isAppLocked(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const state = sessionStorage.getItem(STORAGE_KEYS.IS_LOCKED);
      return state === 'true';
    } catch {
      return false;
    }
  }

  setAppLocked(locked: boolean): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOCKED, locked ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to update app lock state', e);
    }
  }

  // --- Reset to default mock data ---
  resetToDefaults(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
  }
}

export const dataService = new DataService();
