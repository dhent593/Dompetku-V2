import { Transaction, UserProfile, CategorySummary, PaymentCard } from '@/types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, INITIAL_CARDS } from './dummyData';

const STORAGE_KEYS = {
  USER: 'mypocket_user_v1',
  TRANSACTIONS: 'mypocket_transactions_v1',
  CARDS: 'mypocket_cards_v1',
  IS_LOGGED_IN: 'mypocket_auth_status_v1',
  IS_LOCKED: 'mypocket_is_locked_v1',
};

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- Auth Session ---
  getAuthState(): boolean {
    if (!this.isBrowser()) return true;
    try {
      const state = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      // Default to true for smooth first-time demo, but toggleable on logout/login
      return state === null ? true : state === 'true';
    } catch {
      return true;
    }
  }

  setAuthState(isLoggedIn: boolean): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, isLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
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

  // --- Transactions (CRUD) ---
  // READ
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

  // CREATE
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

  // UPDATE
  updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'timestamp'>>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = transactions[index];

    // Revert old transaction effect on balance
    const user = this.getUser();
    const oldDelta = existing.type === 'income' ? existing.amount : -existing.amount;
    user.balance = user.balance - oldDelta;
    user.totalBalance = user.totalBalance - oldDelta;

    // Apply updates
    const updatedTx: Transaction = {
      ...existing,
      ...updates,
    };
    transactions[index] = updatedTx;
    this.saveTransactions(transactions);

    // Apply new transaction effect on balance
    const newDelta = updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount;
    user.balance = Math.max(0, user.balance + newDelta);
    user.totalBalance = Math.max(0, user.totalBalance + newDelta);
    this.saveUser(user);

    return updatedTx;
  }

  // DELETE
  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const target = transactions.find((t) => t.id === id);
    if (!target) return false;

    const remaining = transactions.filter((t) => t.id !== id);
    this.saveTransactions(remaining);

    // Revert balance effect
    const user = this.getUser();
    const delta = target.type === 'income' ? -target.amount : target.amount;
    user.balance = Math.max(0, user.balance + delta);
    user.totalBalance = Math.max(0, user.totalBalance + delta);
    this.saveUser(user);

    return true;
  }

  // --- Payment Cards (CRUD) ---
  getCards(): PaymentCard[] {
    if (!this.isBrowser()) return INITIAL_CARDS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_CARDS;
  }

  saveCards(cards: PaymentCard[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save cards', e);
    }
  }

  addCard(cardData: Omit<PaymentCard, 'id'>): PaymentCard {
    const cards = this.getCards();
    const newCard: PaymentCard = {
      ...cardData,
      id: `card_${Date.now()}`,
    };
    if (newCard.isDefault) {
      cards.forEach((c) => (c.isDefault = false));
      // update user card mask
      const user = this.getUser();
      user.cardNumberMask = newCard.cardNumberMask;
      user.cardExpiry = newCard.cardExpiry;
      this.saveUser(user);
    }
    const updated = [...cards, newCard];
    this.saveCards(updated);
    return newCard;
  }

  deleteCard(id: string): boolean {
    const cards = this.getCards();
    const remaining = cards.filter((c) => c.id !== id);
    if (remaining.length === 0) return false; // keep at least one
    if (cards.find((c) => c.id === id)?.isDefault) {
      remaining[0].isDefault = true;
      const user = this.getUser();
      user.cardNumberMask = remaining[0].cardNumberMask;
      user.cardExpiry = remaining[0].cardExpiry;
      this.saveUser(user);
    }
    this.saveCards(remaining);
    return true;
  }

  setDefaultCard(id: string): void {
    const cards = this.getCards();
    cards.forEach((c) => {
      c.isDefault = c.id === id;
      if (c.isDefault) {
        const user = this.getUser();
        user.cardNumberMask = c.cardNumberMask;
        user.cardExpiry = c.cardExpiry;
        this.saveUser(user);
      }
    });
    this.saveCards(cards);
  }

  // --- Reset to default mock data ---
  resetToDefaults(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
  }
}

export const dataService = new DataService();
