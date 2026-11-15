import { Transaction, UserProfile, CategorySummary, PaymentCard, Pocket, DebtItem, AssetItem, CategoryBudget } from '@/types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_POCKETS, INITIAL_DEBTS, INITIAL_ASSETS, INITIAL_BUDGETS } from './dummyData';

const STORAGE_KEYS = {
  USER: 'mypocket_user_v1',
  TRANSACTIONS: 'mypocket_transactions_v1',
  CARDS: 'mypocket_cards_v1',
  POCKETS: 'mypocket_pockets_v1',
  DEBTS: 'mypocket_debts_v1',
  ASSETS: 'mypocket_assets_v1',
  BUDGETS: 'mypocket_budgets_v1',
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

  getAppLocked(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const state = sessionStorage.getItem(STORAGE_KEYS.IS_LOCKED);
      return state === 'true';
    } catch {
      return false;
    }
  }

  setAppLocked(isLocked: boolean): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOCKED, isLocked ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save locked state', e);
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

  // --- Pockets (Kantong Saya) CRUD ---
  getPockets(): Pocket[] {
    if (!this.isBrowser()) return INITIAL_POCKETS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POCKETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load pockets', e);
    }
    return INITIAL_POCKETS;
  }

  savePockets(pockets: Pocket[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.POCKETS, JSON.stringify(pockets));
    } catch (e) {
      console.error('Failed to save pockets', e);
    }
  }

  addPocket(data: Omit<Pocket, 'id' | 'createdAt'>): Pocket {
    const pockets = this.getPockets();
    const newPocket: Pocket = {
      ...data,
      id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    // If an initial deposit was allocated, record it and adjust balance
    if (newPocket.balance > 0) {
      this.addTransaction({
        title: `Setoran Awal ${newPocket.name}`,
        category: 'other',
        amount: newPocket.balance,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        dateGroup: 'TODAY',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        note: `Setoran awal kantong ${newPocket.name}`,
      });
    }

    const updated = [...pockets, newPocket];
    this.savePockets(updated);
    return newPocket;
  }

  updatePocket(id: string, updates: Partial<Omit<Pocket, 'id' | 'createdAt'>>): Pocket | null {
    const pockets = this.getPockets();
    const index = pockets.findIndex((p) => p.id === id);
    if (index === -1) return null;

    pockets[index] = {
      ...pockets[index],
      ...updates,
    };

    this.savePockets(pockets);
    return pockets[index];
  }

  deletePocket(id: string): boolean {
    const pockets = this.getPockets();
    const target = pockets.find((p) => p.id === id);
    if (!target) return false;

    // Refund any remaining balance in this pocket back to user main balance
    if (target.balance > 0) {
      this.addTransaction({
        title: `Pengembalian ${target.name}`,
        category: 'other',
        amount: target.balance,
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        dateGroup: 'TODAY',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        note: `Penutupan kantong ${target.name}`,
      });
    }

    const remaining = pockets.filter((p) => p.id !== id);
    this.savePockets(remaining);
    return true;
  }

  transferToPocket(pocketId: string, amount: number): boolean {
    const user = this.getUser();
    if (amount <= 0 || amount > user.balance) return false;

    const pockets = this.getPockets();
    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket) return false;

    pocket.balance += amount;
    this.savePockets(pockets);

    // Create a transaction record for this allocation (addTransaction will adjust user balance)
    this.addTransaction({
      title: `Alokasi ke ${pocket.name}`,
      category: 'other',
      amount: amount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      dateGroup: 'TODAY',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note: `Top Up Kantong ${pocket.name}`,
    });

    return true;
  }

  withdrawFromPocket(pocketId: string, amount: number): boolean {
    const pockets = this.getPockets();
    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket || amount <= 0 || amount > pocket.balance) return false;

    pocket.balance -= amount;
    this.savePockets(pockets);

    // Create a transaction record for this withdrawal (addTransaction will adjust user balance)
    this.addTransaction({
      title: `Tarik dari ${pocket.name}`,
      category: 'other',
      amount: amount,
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      dateGroup: 'TODAY',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note: `Pencairan Kantong ${pocket.name}`,
    });

    return true;
  }

  transferBetweenPockets(fromPocketId: string, toPocketId: string, amount: number): boolean {
    if (fromPocketId === toPocketId || amount <= 0) return false;
    const pockets = this.getPockets();
    const sourcePocket = pockets.find((p) => p.id === fromPocketId);
    const destPocket = pockets.find((p) => p.id === toPocketId);

    if (!sourcePocket || !destPocket) return false;
    if (sourcePocket.balance < amount) return false;

    sourcePocket.balance -= amount;
    destPocket.balance += amount;

    this.savePockets(pockets);
    return true;
  }

  // --- Debts & Installments (CRUD + Pay via Pocket) ---
  getDebts(): DebtItem[] {
    if (!this.isBrowser()) return INITIAL_DEBTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEBTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load debts from storage', e);
    }
    return INITIAL_DEBTS;
  }

  saveDebts(debts: DebtItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    } catch (e) {
      console.error('Failed to save debts', e);
    }
  }

  addDebt(debt: Omit<DebtItem, 'id' | 'createdAt'>): DebtItem {
    const debts = this.getDebts();
    const newDebt: DebtItem = {
      ...debt,
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
      status: debt.status || 'active',
      paymentHistory: debt.paymentHistory || [],
    };
    debts.unshift(newDebt);
    this.saveDebts(debts);
    return newDebt;
  }

  updateDebt(id: string, updates: Partial<Omit<DebtItem, 'id' | 'createdAt'>>): DebtItem | null {
    const debts = this.getDebts();
    const index = debts.findIndex((d) => d.id === id);
    if (index === -1) return null;

    debts[index] = { ...debts[index], ...updates };
    this.saveDebts(debts);
    return debts[index];
  }

  deleteDebt(id: string): boolean {
    const debts = this.getDebts();
    const filtered = debts.filter((d) => d.id !== id);
    if (filtered.length === debts.length) return false;
    this.saveDebts(filtered);
    return true;
  }

  payDebtInstallment(debtId: string, amount: number, pocketId: string): boolean {
    if (amount <= 0) return false;
    const debts = this.getDebts();
    const debt = debts.find((d) => d.id === debtId);
    if (!debt || debt.remainingAmount <= 0) return false;

    // Deduct from pocket
    const pockets = this.getPockets();
    const pocket = pockets.find((p) => p.id === pocketId);
    if (!pocket || pocket.balance < amount) return false;

    pocket.balance -= amount;
    this.savePockets(pockets);

    // Update debt
    const actualPay = Math.min(amount, debt.remainingAmount);
    debt.remainingAmount -= actualPay;
    debt.paidInstallments = (debt.paidInstallments || 0) + 1;
    if (debt.remainingAmount <= 0) {
      debt.status = 'paid_off';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newHistory = debt.paymentHistory || [];
    newHistory.unshift({
      id: `dp_${Date.now()}`,
      date: todayStr,
      amount: actualPay,
      pocketName: pocket.name,
    });
    debt.paymentHistory = newHistory;
    this.saveDebts(debts);

    // Record expense transaction
    this.addTransaction({
      title: `Cicilan: ${debt.title}`,
      category: 'bill',
      amount: actualPay,
      type: 'expense',
      date: todayStr,
      dateGroup: 'TODAY',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note: `Bayar cicilan ke ${debt.lender} via kantong ${pocket.name}`,
    });

    return true;
  }

  // --- Assets (CRUD) ---
  getAssets(): AssetItem[] {
    if (!this.isBrowser()) return INITIAL_ASSETS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load assets from storage', e);
    }
    return INITIAL_ASSETS;
  }

  saveAssets(assets: AssetItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save assets', e);
    }
  }

  addAsset(asset: Omit<AssetItem, 'id' | 'createdAt'>): AssetItem {
    const assets = this.getAssets();
    const newAsset: AssetItem = {
      ...asset,
      id: `ast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    assets.unshift(newAsset);
    this.saveAssets(assets);
    return newAsset;
  }

  updateAsset(id: string, updates: Partial<Omit<AssetItem, 'id' | 'createdAt'>>): AssetItem | null {
    const assets = this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    assets[index] = { ...assets[index], ...updates };
    this.saveAssets(assets);
    return assets[index];
  }

  deleteAsset(id: string): boolean {
    const assets = this.getAssets();
    const filtered = assets.filter((a) => a.id !== id);
    if (filtered.length === assets.length) return false;
    this.saveAssets(filtered);
    return true;
  }

  // --- Category Budgets ---
  getBudgets(): CategoryBudget[] {
    if (!this.isBrowser()) return INITIAL_BUDGETS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load budgets from storage', e);
    }
    return INITIAL_BUDGETS;
  }

  saveBudgets(budgets: CategoryBudget[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }

  setCategoryBudget(category: Transaction['category'], monthlyLimit: number): CategoryBudget {
    const budgets = this.getBudgets();
    const index = budgets.findIndex((b) => b.category === category);
    if (index !== -1) {
      budgets[index].monthlyLimit = monthlyLimit;
      this.saveBudgets(budgets);
      return budgets[index];
    } else {
      const newBudget: CategoryBudget = {
        id: `bdg_${Date.now()}`,
        category,
        monthlyLimit,
      };
      budgets.push(newBudget);
      this.saveBudgets(budgets);
      return newBudget;
    }
  }

  deleteCategoryBudget(category: Transaction['category']): boolean {
    const budgets = this.getBudgets();
    const filtered = budgets.filter((b) => b.category !== category);
    if (filtered.length === budgets.length) return false;
    this.saveBudgets(filtered);
    return true;
  }

  // --- Reset to default mock data ---
  resetToDefaults(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.POCKETS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
  }
}

export const dataService = new DataService();
