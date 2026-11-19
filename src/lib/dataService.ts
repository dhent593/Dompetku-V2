import { Transaction, UserProfile, CategorySummary, PaymentCard, Pocket, DebtItem, AssetItem, CategoryBudget, NoteItem, WishlistItem } from '@/types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_POCKETS, INITIAL_DEBTS, INITIAL_ASSETS, INITIAL_BUDGETS, INITIAL_NOTES, INITIAL_WISHLISTS } from './dummyData';

export const STARTER_POCKETS: Pocket[] = [
  {
    id: 'pkt_mandiri',
    name: 'Mandiri',
    balance: 0,
    targetAmount: 10000000,
    color: '#635BFF',
    iconName: 'WalletCards',
    createdAt: 1700000000000,
  },
  {
    id: 'pkt_bri',
    name: 'BRI',
    balance: 0,
    targetAmount: 5000000,
    color: '#0284C7',
    iconName: 'Building2',
    createdAt: 1700000000001,
  },
  {
    id: 'pkt_shoppepay',
    name: 'ShoppePay',
    balance: 0,
    targetAmount: 2000000,
    color: '#EA580C',
    iconName: 'Smartphone',
    createdAt: 1700000000002,
  },
];

export const EMPTY_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  cardNumberMask: '.... ----',
  cardExpiry: '--/--',
  balance: 0,
  totalBalance: 0,
  isOnline: false,
  biometricEnabled: false,
  mPinHash: '1234',
};

const STORAGE_KEYS = {
  USER: 'mypocket_user_v1',
  REGISTERED_ACCOUNTS: 'mypocket_registered_accounts_v1',
  TRANSACTIONS: 'mypocket_transactions_v1',
  CARDS: 'mypocket_cards_v1',
  POCKETS: 'mypocket_pockets_v1',
  DEBTS: 'mypocket_debts_v1',
  ASSETS: 'mypocket_assets_v1',
  BUDGETS: 'mypocket_budgets_v1',
  NOTES: 'mypocket_notes_v1',
  WISHLISTS: 'mypocket_wishlists_v1',
  IS_LOGGED_IN: 'mypocket_auth_status_v1',
  IS_LOCKED: 'mypocket_is_locked_v1',
};

export function hashCredential(pass: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x9e3779b9;
  const salted = `mypocket_salt_sec_${pass}_v2026`;
  for (let i = 0; i < salted.length; i++) {
    const code = salted.charCodeAt(i);
    hash1 ^= code;
    hash1 = (hash1 * 0x01000193) >>> 0;
    hash2 = (hash2 + code + (hash2 << 6) + (hash2 >> 2)) >>> 0;
  }
  return `${hash1.toString(16).padStart(8, '0')}${hash2.toString(16).padStart(8, '0')}`;
}

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  isDemoUser(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const u = JSON.parse(stored);
        return u?.email === 'smith@example.com';
      }
    } catch {}
    return false;
  }

  private getKey(baseKey: string): string {
    if (!this.isBrowser()) return baseKey;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.email && u.email !== 'smith@example.com') {
          const safeEmail = u.email.replace(/[^a-zA-Z0-9_]/g, '_');
          return `${baseKey}_${safeEmail}`;
        }
      }
    } catch {}
    return baseKey;
  }

  // --- Auth Session ---
  getAuthState(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const state = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return state === 'true';
    } catch {
      return false;
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

  // --- Registered Accounts Local Registry (Secure Hashed) ---
  saveRegisteredAccount(account: { name: string; email: string; pass: string }): void {
    if (!this.isBrowser()) return;
    try {
      const list = this.getRegisteredAccounts();
      const filtered = list.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
      // Store hashed password, NEVER plaintext
      filtered.push({
        name: account.name,
        email: account.email,
        passHash: hashCredential(account.pass),
      });
      localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to save registered account', e);
    }
  }

  getRegisteredAccounts(): Array<{ name: string; email: string; pass?: string; passHash?: string }> {
    if (!this.isBrowser()) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  verifyLocalCredentials(email: string, pass: string): { name: string; email: string } | null {
    const list = this.getRegisteredAccounts();
    const targetHash = hashCredential(pass);
    const found = list.find((a) => {
      const emailMatches = a.email.toLowerCase().trim() === email.toLowerCase().trim();
      if (!emailMatches) return false;
      // Supports both hashed credentials and legacy plaintext
      return a.passHash === targetHash || a.pass === pass;
    });
    return found ? { name: found.name, email: found.email } : null;
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
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        if (stored) {
          const user: UserProfile = JSON.parse(stored);
          const pockets = this.getPockets();
          const sumPockets = pockets.reduce((sum, p) => sum + p.balance, 0);
          user.balance = sumPockets;
          user.totalBalance = sumPockets;
          return user;
        }
      } catch (e) {
        console.error('Failed to load user profile from storage', e);
      }
    }
    return this.isDemoUser() ? { ...INITIAL_USER } : { ...EMPTY_USER };
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
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_TRANSACTIONS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.TRANSACTIONS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load transactions from storage', e);
    }
    return this.isDemoUser() ? INITIAL_TRANSACTIONS : [];
  }

  saveTransactions(transactions: Transaction[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.TRANSACTIONS), JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  // CREATE
  addTransaction(newTx: Omit<Transaction, 'id' | 'timestamp'> & { timestamp?: number }): Transaction {
    const transactions = this.getTransactions();
    const pockets = this.getPockets();
    const isNonePocket = newTx.pocketId === 'none' || newTx.pocketId === 'manual';
    const pktId = isNonePocket
      ? undefined
      : newTx.pocketId || (pockets.length > 0 ? pockets[0].id : undefined);
    let pocketName = isNonePocket ? (newTx.pocketName || 'Pembayaran Manual') : newTx.pocketName;

    // Apply transaction to selected pocket
    if (pktId) {
      const pkt = pockets.find((p) => p.id === pktId);
      if (pkt) {
        if (newTx.type === 'income') {
          pkt.balance += newTx.amount;
        } else {
          pkt.balance = Math.max(0, pkt.balance - newTx.amount);
        }
        pocketName = pkt.name;
        this.savePockets(pockets);
      }
    }

    // Recalculate user balance as the sum of all pockets
    const totalPockets = pockets.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

    const created: Transaction = {
      ...newTx,
      pocketId: pktId,
      pocketName,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: newTx.timestamp || Date.now(),
    };

    const updated = [created, ...transactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    this.saveTransactions(updated);

    return created;
  }

  // UPDATE
  updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'timestamp'>>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = transactions[index];
    const pockets = this.getPockets();

    // Revert old transaction on old pocket
    if (existing.pocketId) {
      const pkt = pockets.find((p) => p.id === existing.pocketId);
      if (pkt) {
        if (existing.type === 'income') {
          pkt.balance = Math.max(0, pkt.balance - existing.amount);
        } else {
          pkt.balance += existing.amount;
        }
      }
    }

    // Apply updates
    const updatedTx: Transaction = {
      ...existing,
      ...updates,
    };

    // Apply new transaction on target pocket
    const targetPocketId = updatedTx.pocketId || existing.pocketId;
    if (targetPocketId) {
      const pkt = pockets.find((p) => p.id === targetPocketId);
      if (pkt) {
        if (updatedTx.type === 'income') {
          pkt.balance += updatedTx.amount;
        } else {
          pkt.balance = Math.max(0, pkt.balance - updatedTx.amount);
        }
        updatedTx.pocketId = targetPocketId;
        updatedTx.pocketName = pkt.name;
      }
    }

    this.savePockets(pockets);

    // Recalculate user balance as the sum of all pockets
    const totalPockets = pockets.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

    transactions[index] = updatedTx;
    this.saveTransactions(transactions);

    return updatedTx;
  }

  // DELETE
  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const target = transactions.find((t) => t.id === id);
    if (!target) return false;

    const remaining = transactions.filter((t) => t.id !== id);
    this.saveTransactions(remaining);

    // Revert balance on pocket
    const pockets = this.getPockets();
    if (target.pocketId) {
      const pkt = pockets.find((p) => p.id === target.pocketId);
      if (pkt) {
        if (target.type === 'income') {
          pkt.balance = Math.max(0, pkt.balance - target.amount);
        } else {
          pkt.balance += target.amount;
        }
        this.savePockets(pockets);
      }
    }

    // Recalculate user balance as the sum of all pockets
    const totalPockets = pockets.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

    return true;
  }

  // --- Payment Cards (CRUD) ---
  getCards(): PaymentCard[] {
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_CARDS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.CARDS));
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return this.isDemoUser() ? INITIAL_CARDS : [];
  }

  saveCards(cards: PaymentCard[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.CARDS), JSON.stringify(cards));
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
      user.cardExpiry = newCard.cardExpiry || '12/28';
      this.saveUser(user);
    }
    const updated = [...cards, newCard];
    this.saveCards(updated);
    return newCard;
  }

  updateCard(id: string, updates: Partial<Omit<PaymentCard, 'id'>>): PaymentCard | null {
    const cards = this.getCards();
    const index = cards.findIndex((c) => c.id === id);
    if (index === -1) return null;
    cards[index] = { ...cards[index], ...updates };
    if (cards[index].isDefault && cards[index].cardNumberMask) {
      const user = this.getUser();
      user.cardNumberMask = cards[index].cardNumberMask;
      if (cards[index].cardExpiry) user.cardExpiry = cards[index].cardExpiry;
      this.saveUser(user);
    }
    this.saveCards(cards);
    return cards[index];
  }

  deleteCard(id: string): boolean {
    const cards = this.getCards();
    const remaining = cards.filter((c) => c.id !== id);
    if (remaining.length === 0) return false; // keep at least one
    if (cards.find((c) => c.id === id)?.isDefault) {
      remaining[0].isDefault = true;
      const user = this.getUser();
      user.cardNumberMask = remaining[0].cardNumberMask;
      user.cardExpiry = remaining[0].cardExpiry || '12/28';
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
        user.cardExpiry = c.cardExpiry || '12/28';
        this.saveUser(user);
      }
    });
    this.saveCards(cards);
  }

  // --- Pockets (Kantong Saya) CRUD ---
  getPockets(): Pocket[] {
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_POCKETS : STARTER_POCKETS;
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.POCKETS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load pockets', e);
    }
    return this.isDemoUser() ? INITIAL_POCKETS : STARTER_POCKETS;
  }

  savePockets(pockets: Pocket[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.POCKETS), JSON.stringify(pockets));
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

    const updated = [...pockets, newPocket];
    this.savePockets(updated);

    const totalPockets = updated.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

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

    const totalPockets = pockets.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

    return pockets[index];
  }

  deletePocket(id: string): boolean {
    const pockets = this.getPockets();
    const remaining = pockets.filter((p) => p.id !== id);
    this.savePockets(remaining);

    const totalPockets = remaining.reduce((sum, p) => sum + p.balance, 0);
    const user = this.getUser();
    user.balance = totalPockets;
    user.totalBalance = totalPockets;
    this.saveUser(user);

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
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_DEBTS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.DEBTS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load debts from storage', e);
    }
    return this.isDemoUser() ? INITIAL_DEBTS : [];
  }

  saveDebts(debts: DebtItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.DEBTS), JSON.stringify(debts));
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

  payDebtInstallment(debtId: string, amount: number, pocketId?: string, debtTitle?: string): boolean {
    if (amount <= 0) return false;
    const debts = this.getDebts();
    // 1. Match by exact id
    let debt = debts.find((d) => d.id === debtId);
    // 2. Match by title if id mismatch (e.g. Supabase UUID vs local id)
    if (!debt && debtTitle) {
      debt = debts.find((d) => d.title.toLowerCase() === debtTitle.toLowerCase() && d.remainingAmount > 0);
    }
    // 3. Fallback matching in case debtId is Supabase UUID while localStorage has temporary debt_ ID
    if (!debt) {
      debt = debts.find((d) => d.remainingAmount > 0 && (d.id.includes(debtId) || debtId.includes(d.id)));
    }
    if (!debt && debts.length === 1) {
      debt = debts[0];
    }
    if (!debt || debt.remainingAmount <= 0) return false;

    const isManualPay = !pocketId || pocketId === 'none' || pocketId === 'manual';
    let pocketName = 'Pembayaran Manual';

    if (!isManualPay) {
      const pockets = this.getPockets();
      const pocket = pockets.find((p) => p.id === pocketId);
      if (!pocket || pocket.balance < amount) return false;
      pocketName = pocket.name;
    }

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
      pocketName: isManualPay ? 'Pembayaran Manual / Tunai' : pocketName,
    });
    debt.paymentHistory = newHistory;
    this.saveDebts(debts);

    // Record expense transaction (addTransaction will deduct from pocket only if pocketId !== 'none')
    this.addTransaction({
      title: `Cicilan: ${debt.title}`,
      category: 'bill',
      amount: actualPay,
      type: 'expense',
      date: todayStr,
      dateGroup: 'TODAY',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note: isManualPay
        ? `Bayar cicilan ke ${debt.lender} (Manual / Tanpa Kantong)`
        : `Bayar cicilan ke ${debt.lender} via kantong ${pocketName}`,
      pocketId: isManualPay ? 'none' : pocketId,
      pocketName: isManualPay ? 'Pembayaran Manual' : pocketName,
    });

    return true;
  }

  // --- Assets (CRUD) ---
  getAssets(): AssetItem[] {
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_ASSETS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.ASSETS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load assets from storage', e);
    }
    return this.isDemoUser() ? INITIAL_ASSETS : [];
  }

  saveAssets(assets: AssetItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.ASSETS), JSON.stringify(assets));
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

    // If funded from a pocket, deduct pocket balance and record expense transaction
    if (asset.pocketId && asset.pocketId !== 'none') {
      const pockets = this.getPockets();
      const pocket = pockets.find((p) => p.id === asset.pocketId);
      if (pocket && newAsset.purchasePrice > 0) {
        this.addTransaction({
          title: `Beli Aset: ${newAsset.name}`,
          category: 'investment',
          amount: newAsset.purchasePrice,
          type: 'expense',
          date: newAsset.purchaseDate || new Date().toISOString().split('T')[0],
          dateGroup: 'TODAY',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          note: newAsset.notes
            ? `Beli aset ${newAsset.name}: ${newAsset.notes}`
            : `Pembelian aset portofolio (${newAsset.category}) via ${pocket.name}`,
          pocketId: asset.pocketId,
          pocketName: pocket.name,
        });
      }
    }

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
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_BUDGETS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.BUDGETS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load budgets from storage', e);
    }
    return this.isDemoUser() ? INITIAL_BUDGETS : [];
  }

  saveBudgets(budgets: CategoryBudget[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.BUDGETS), JSON.stringify(budgets));
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

  // --- Financial Notes (CRUD) ---
  getNotes(): NoteItem[] {
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_NOTES : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.NOTES));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load notes from storage', e);
    }
    return this.isDemoUser() ? INITIAL_NOTES : [];
  }

  saveNotes(notes: NoteItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.NOTES), JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }

  addNote(note: Omit<NoteItem, 'id' | 'createdAt'>): NoteItem {
    const notes = this.getNotes();
    const newNote: NoteItem = {
      ...note,
      id: `note_${Date.now()}`,
      createdAt: Date.now(),
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  updateNote(id: string, updates: Partial<Omit<NoteItem, 'id' | 'createdAt'>>): NoteItem | null {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...updates };
    this.saveNotes(notes);
    return notes[index];
  }

  deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveNotes(filtered);
    return true;
  }

  // --- Wishlist Items (CRUD) ---
  getWishlists(): WishlistItem[] {
    if (!this.isBrowser()) return this.isDemoUser() ? INITIAL_WISHLISTS : [];
    try {
      const stored = localStorage.getItem(this.getKey(STORAGE_KEYS.WISHLISTS));
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load wishlists from storage', e);
    }
    return this.isDemoUser() ? INITIAL_WISHLISTS : [];
  }

  saveWishlists(wishlists: WishlistItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getKey(STORAGE_KEYS.WISHLISTS), JSON.stringify(wishlists));
    } catch (e) {
      console.error('Failed to save wishlists', e);
    }
  }

  addWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt'>): WishlistItem {
    const wishlists = this.getWishlists();
    const newItem: WishlistItem = {
      ...item,
      id: `wsh_${Date.now()}`,
      createdAt: Date.now(),
    };
    wishlists.unshift(newItem);
    this.saveWishlists(wishlists);
    return newItem;
  }

  updateWishlistItem(id: string, updates: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>): WishlistItem | null {
    const wishlists = this.getWishlists();
    const index = wishlists.findIndex((w) => w.id === id);
    if (index === -1) {
      const fallback = INITIAL_WISHLISTS.find((w) => w.id === id);
      if (fallback) {
        const updated = { ...fallback, ...updates };
        wishlists.push(updated);
        this.saveWishlists(wishlists);
        return updated;
      }
      return null;
    }
    wishlists[index] = { ...wishlists[index], ...updates };
    this.saveWishlists(wishlists);
    return wishlists[index];
  }

  deleteWishlistItem(id: string): boolean {
    const wishlists = this.getWishlists();
    const filtered = wishlists.filter((w) => w.id !== id);
    this.saveWishlists(filtered);
    return true;
  }

  // --- Reset & Clear Methods ---
  clearUserData(email?: string): void {
    if (!this.isBrowser()) return;
    const targetEmail = email || this.getUser().email;
    if (targetEmail && targetEmail !== 'smith@example.com') {
      const safeEmail = targetEmail.replace(/[^a-zA-Z0-9_]/g, '_');
      localStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.POCKETS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.CARDS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.DEBTS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.ASSETS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.BUDGETS}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.NOTES}_${safeEmail}`);
      localStorage.removeItem(`${STORAGE_KEYS.WISHLISTS}_${safeEmail}`);
    } else {
      this.resetToDefaults();
    }
  }

  resetToDefaults(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.POCKETS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.WISHLISTS);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
  }
}

export const dataService = new DataService();
