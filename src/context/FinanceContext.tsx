'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, CategorySummary, NavTab, PaymentCard, Pocket, DebtItem, AssetItem, CategoryBudget, NoteItem, WishlistItem } from '@/types';
import { dataService, STARTER_POCKETS } from '@/lib/dataService';
import {
  CATEGORY_SUMMARIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CARDS,
  INITIAL_POCKETS,
  INITIAL_DEBTS,
  INITIAL_ASSETS,
  INITIAL_BUDGETS,
  INITIAL_NOTES,
  INITIAL_WISHLISTS,
} from '@/lib/dummyData';
import { useAuth } from './AuthContext';
import { SupabaseService } from '@/lib/supabaseService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface FinanceContextType {
  transactions: Transaction[];
  categories: CategorySummary[];
  cards: PaymentCard[];
  pockets: Pocket[];
  selectedPocket: Pocket | null;
  setSelectedPocket: (pocket: Pocket | null) => void;
  debts: DebtItem[];
  assets: AssetItem[];
  budgets: CategoryBudget[];
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => NoteItem;
  updateNote: (id: string, updates: Partial<Omit<NoteItem, 'id' | 'createdAt'>>) => NoteItem | null;
  deleteNote: (id: string) => boolean;
  wishlists: WishlistItem[];
  setWishlists: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => WishlistItem;
  updateWishlistItem: (id: string, updates: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>) => WishlistItem | null;
  deleteWishlistItem: (id: string) => boolean;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addTransaction: (tx: {
    title: string;
    category: Transaction['category'];
    amount: number;
    type: 'income' | 'expense';
    note?: string;
    pocketId?: string;
  }) => Transaction;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'timestamp'>>
  ) => Transaction | null;
  deleteTransaction: (id: string) => boolean;
  addCard: (card: Omit<PaymentCard, 'id'>) => PaymentCard;
  updateCard: (id: string, updates: Partial<Omit<PaymentCard, 'id'>>) => PaymentCard | null;
  deleteCard: (id: string) => boolean;
  setDefaultCard: (id: string) => void;
  addPocket: (pocket: Omit<Pocket, 'id' | 'createdAt'>) => Pocket;
  updatePocket: (id: string, updates: Partial<Omit<Pocket, 'id' | 'createdAt'>>) => Pocket | null;
  deletePocket: (id: string) => boolean;
  transferToPocket: (pocketId: string, amount: number) => boolean;
  withdrawFromPocket: (pocketId: string, amount: number) => boolean;
  transferBetweenPockets: (fromPocketId: string, toPocketId: string, amount: number) => boolean;
  transferMoney: (recipient: string, amount: number, note?: string) => boolean;
  withdrawMoney: (amount: number, bankName?: string) => boolean;
  addDebt: (debt: Omit<DebtItem, 'id' | 'createdAt'>) => DebtItem;
  updateDebt: (id: string, updates: Partial<Omit<DebtItem, 'id' | 'createdAt'>>) => DebtItem | null;
  deleteDebt: (id: string) => boolean;
  payDebtInstallment: (debtId: string, amount: number, pocketId: string) => boolean;
  addAsset: (asset: Omit<AssetItem, 'id' | 'createdAt'>) => AssetItem;
  updateAsset: (id: string, updates: Partial<Omit<AssetItem, 'id' | 'createdAt'>>) => AssetItem | null;
  deleteAsset: (id: string) => boolean;
  setCategoryBudget: (category: Transaction['category'], monthlyLimit: number) => CategoryBudget;
  deleteCategoryBudget: (category: Transaction['category']) => boolean;
  filteredTransactions: Transaction[];
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => dataService.getTransactions());
  const [cards, setCards] = useState<PaymentCard[]>(() => dataService.getCards());
  const [pockets, setPockets] = useState<Pocket[]>(() => dataService.getPockets());
  const [selectedPocket, setSelectedPocket] = useState<Pocket | null>(null);
  const [debts, setDebts] = useState<DebtItem[]>(() => dataService.getDebts());
  const [assets, setAssets] = useState<AssetItem[]>(() => dataService.getAssets());
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => dataService.getBudgets());
  const [notes, setNotes] = useState<NoteItem[]>(() => dataService.getNotes());
  const [wishlists, setWishlists] = useState<WishlistItem[]>(() => dataService.getWishlists());
  const [categories, setCategories] = useState<CategorySummary[]>(CATEGORY_SUMMARIES);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [sbPockets, sbTx, sbCards, sbDebts, sbAssets, sbBudgets, sbNotes, sbWishlists] = await Promise.all([
        SupabaseService.getPockets(),
        SupabaseService.getTransactions(),
        SupabaseService.getCards(),
        SupabaseService.getDebts(),
        SupabaseService.getAssets(),
        SupabaseService.getBudgets(),
        SupabaseService.getNotes(),
        SupabaseService.getWishlists(),
      ]);

      // If brand new user without pockets in Supabase, provision the 3 starter pockets
      let finalPockets = sbPockets;
      if (!sbPockets || sbPockets.length === 0) {
        for (const sp of STARTER_POCKETS) {
          await SupabaseService.createPocket(sp);
        }
        finalPockets = await SupabaseService.getPockets();
      }

      const activePockets = finalPockets && finalPockets.length > 0 ? finalPockets : STARTER_POCKETS;
      setPockets(activePockets);
      setTransactions(sbTx || []);
      setCards(sbCards || []);
      setDebts(sbDebts || []);
      setAssets(sbAssets || []);
      setBudgets(sbBudgets || []);
      setNotes(sbNotes || []);
      setWishlists(sbWishlists || []);

      dataService.savePockets(activePockets);
      dataService.saveTransactions(sbTx || []);
      dataService.saveCards(sbCards || []);
      dataService.saveDebts(sbDebts || []);
      dataService.saveAssets(sbAssets || []);
      dataService.saveBudgets(sbBudgets || []);
      dataService.saveNotes(sbNotes || []);
      dataService.saveWishlists(sbWishlists || []);
    } catch (err) {
      console.warn('Sync from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Sync with persistent local data
    const isDemo = user?.email === 'smith@example.com';
    const loadedTx = dataService.getTransactions();
    setTransactions(loadedTx !== null && loadedTx !== undefined ? loadedTx : (isDemo ? INITIAL_TRANSACTIONS : []));

    const loadedCards = dataService.getCards();
    setCards(loadedCards !== null && loadedCards !== undefined ? loadedCards : (isDemo ? INITIAL_CARDS : []));

    const loadedPockets = dataService.getPockets();
    setPockets(loadedPockets && loadedPockets.length > 0 ? loadedPockets : (isDemo ? INITIAL_POCKETS : STARTER_POCKETS));

    const loadedDebts = dataService.getDebts();
    setDebts(loadedDebts !== null && loadedDebts !== undefined ? loadedDebts : (isDemo ? INITIAL_DEBTS : []));

    const loadedAssets = dataService.getAssets();
    setAssets(loadedAssets !== null && loadedAssets !== undefined ? loadedAssets : (isDemo ? INITIAL_ASSETS : []));

    const loadedBudgets = dataService.getBudgets();
    setBudgets(loadedBudgets !== null && loadedBudgets !== undefined ? loadedBudgets : (isDemo ? INITIAL_BUDGETS : []));

    const loadedNotes = dataService.getNotes();
    setNotes(loadedNotes !== null && loadedNotes !== undefined ? loadedNotes : (isDemo ? INITIAL_NOTES : []));

    const loadedWishlists = dataService.getWishlists();
    setWishlists(loadedWishlists !== null && loadedWishlists !== undefined ? loadedWishlists : (isDemo ? INITIAL_WISHLISTS : []));

    // 2. Fetch from Supabase if user is signed in
    syncFromSupabase();

    // 3. Listen to Supabase auth events
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          syncFromSupabase();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.email, syncFromSupabase]);

  const addTransaction = (tx: {
    title: string;
    category: Transaction['category'];
    amount: number;
    type: 'income' | 'expense';
    note?: string;
    pocketId?: string;
  }): Transaction => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTx = dataService.addTransaction({
      title: tx.title,
      category: tx.category,
      amount: tx.amount,
      type: tx.type,
      date: now.toISOString().split('T')[0],
      dateGroup: 'TODAY',
      time: timeStr,
      note: tx.note || '',
      cardNumber: user.cardNumberMask,
      pocketId: tx.pocketId,
      iconName:
        tx.category === 'shopping'
          ? 'ShoppingBag'
          : tx.category === 'bill'
          ? 'Wifi'
          : tx.category === 'salary'
          ? 'ArrowDownLeft'
          : tx.category === 'travel'
          ? 'Car'
          : tx.category === 'investment'
          ? 'Building2'
          : tx.category === 'food'
          ? 'Burger'
          : tx.category === 'transfer'
          ? 'ArrowRightLeft'
          : tx.type === 'income'
          ? 'ArrowDownLeft'
          : 'ArrowUpRight',
    });

    setTransactions(dataService.getTransactions());
    setPockets(dataService.getPockets());
    updateUser(dataService.getUser());

    if (isSupabaseConfigured) {
      SupabaseService.createTransaction({
        title: tx.title,
        category: tx.category,
        amount: tx.amount,
        type: tx.type,
        date: newTx.date,
        dateGroup: newTx.dateGroup,
        time: newTx.time,
        timestamp: newTx.timestamp,
        iconName: newTx.iconName,
        cardNumber: newTx.cardNumber,
        note: tx.note,
        pocketId: tx.pocketId,
        pocketName: newTx.pocketName,
      }).catch(console.error);
    }

    return newTx;
  };

  const updateTransaction = (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'timestamp'>>
  ): Transaction | null => {
    const updated = dataService.updateTransaction(id, updates);
    if (updated) {
      setTransactions(dataService.getTransactions());
      setPockets(dataService.getPockets());
      updateUser(dataService.getUser());
    }
    return updated;
  };

  const deleteTransaction = (id: string): boolean => {
    const ok = dataService.deleteTransaction(id);
    if (ok) {
      setTransactions(dataService.getTransactions());
      setPockets(dataService.getPockets());
      updateUser(dataService.getUser());
      if (isSupabaseConfigured) {
        SupabaseService.deleteTransaction(id).catch(console.error);
      }
    }
    return ok;
  };

  const addCard = (cardData: Omit<PaymentCard, 'id'>): PaymentCard => {
    const newCard = dataService.addCard(cardData);
    setCards(dataService.getCards());
    updateUser(dataService.getUser());
    if (isSupabaseConfigured) {
      SupabaseService.createCard(cardData).catch(console.error);
    }
    return newCard;
  };

  const updateCard = (id: string, updates: Partial<Omit<PaymentCard, 'id'>>): PaymentCard | null => {
    const updated = dataService.updateCard(id, updates);
    if (updated) {
      setCards(dataService.getCards());
      updateUser(dataService.getUser());
      if (isSupabaseConfigured) {
        SupabaseService.updateCard(id, updates).catch(console.error);
      }
    }
    return updated;
  };

  const deleteCard = (id: string): boolean => {
    const ok = dataService.deleteCard(id);
    if (ok) {
      setCards(dataService.getCards());
      updateUser(dataService.getUser());
      if (isSupabaseConfigured) {
        SupabaseService.deleteCard(id).catch(console.error);
      }
    }
    return ok;
  };

  const setDefaultCard = (id: string): void => {
    dataService.setDefaultCard(id);
    setCards(dataService.getCards());
    updateUser(dataService.getUser());
    if (isSupabaseConfigured) {
      SupabaseService.updateCard(id, { isDefault: true }).catch(console.error);
    }
  };

  const addPocket = (pocketData: Omit<Pocket, 'id' | 'createdAt'>): Pocket => {
    const created = dataService.addPocket(pocketData);
    setPockets(dataService.getPockets());
    setTransactions(dataService.getTransactions());
    updateUser(dataService.getUser());
    if (isSupabaseConfigured) {
      SupabaseService.createPocket(pocketData).then((sbPkt) => {
        if (sbPkt) {
          // Sync ID if generated by Supabase
          setPockets((prev) => prev.map((p) => (p.id === created.id ? { ...p, id: sbPkt.id } : p)));
        }
      }).catch(console.error);
    }
    return created;
  };

  const updatePocket = (id: string, updates: Partial<Omit<Pocket, 'id' | 'createdAt'>>): Pocket | null => {
    const updated = dataService.updatePocket(id, updates);
    if (updated) {
      setPockets(dataService.getPockets());
      if (selectedPocket && selectedPocket.id === id) {
        setSelectedPocket(updated);
      }
      if (isSupabaseConfigured) {
        SupabaseService.updatePocket(id, updates).catch(console.error);
      }
    }
    return updated;
  };

  const deletePocket = (id: string): boolean => {
    const ok = dataService.deletePocket(id);
    if (ok) {
      setPockets(dataService.getPockets());
      setTransactions(dataService.getTransactions());
      updateUser(dataService.getUser());
      if (selectedPocket && selectedPocket.id === id) {
        setSelectedPocket(null);
      }
      if (isSupabaseConfigured) {
        SupabaseService.deletePocket(id).catch(console.error);
      }
    }
    return ok;
  };

  const transferToPocket = (pocketId: string, amount: number): boolean => {
    const ok = dataService.transferToPocket(pocketId, amount);
    if (ok) {
      const updatedPockets = dataService.getPockets();
      setPockets(updatedPockets);
      setTransactions(dataService.getTransactions());
      updateUser(dataService.getUser());
      const updatedSelected = updatedPockets.find((p) => p.id === pocketId) || null;
      setSelectedPocket(updatedSelected);
      if (isSupabaseConfigured && updatedSelected) {
        SupabaseService.updatePocket(pocketId, { balance: updatedSelected.balance }).catch(console.error);
      }
    }
    return ok;
  };

  const withdrawFromPocket = (pocketId: string, amount: number): boolean => {
    const ok = dataService.withdrawFromPocket(pocketId, amount);
    if (ok) {
      const updatedPockets = dataService.getPockets();
      setPockets(updatedPockets);
      setTransactions(dataService.getTransactions());
      updateUser(dataService.getUser());
      const updatedSelected = updatedPockets.find((p) => p.id === pocketId) || null;
      setSelectedPocket(updatedSelected);
      if (isSupabaseConfigured && updatedSelected) {
        SupabaseService.updatePocket(pocketId, { balance: updatedSelected.balance }).catch(console.error);
      }
    }
    return ok;
  };

  const transferBetweenPockets = (fromPocketId: string, toPocketId: string, amount: number): boolean => {
    const ok = dataService.transferBetweenPockets(fromPocketId, toPocketId, amount);
    if (ok) {
      const updatedPockets = dataService.getPockets();
      setPockets(updatedPockets);
      const updatedSelected = updatedPockets.find((p) => p.id === fromPocketId) || null;
      setSelectedPocket(updatedSelected);
      if (isSupabaseConfigured) {
        const p1 = updatedPockets.find((p) => p.id === fromPocketId);
        const p2 = updatedPockets.find((p) => p.id === toPocketId);
        if (p1) SupabaseService.updatePocket(fromPocketId, { balance: p1.balance }).catch(console.error);
        if (p2) SupabaseService.updatePocket(toPocketId, { balance: p2.balance }).catch(console.error);
      }
    }
    return ok;
  };

  const transferMoney = (recipient: string, amount: number, note?: string): boolean => {
    if (amount <= 0 || amount > user.balance) {
      return false;
    }

    addTransaction({
      title: `Transfer to ${recipient}`,
      category: 'transfer',
      amount,
      type: 'expense',
      pocketId: pockets[0]?.id,
      note: note || `Fund transfer to ${recipient}`,
    });

    return true;
  };

  const withdrawMoney = (amount: number, bankName: string = 'Bank Account'): boolean => {
    if (amount <= 0 || amount > user.totalBalance) {
      return false;
    }

    addTransaction({
      title: `Withdraw to ${bankName}`,
      category: 'transfer',
      amount,
      type: 'expense',
      pocketId: pockets[0]?.id,
      note: `Funds withdrawn to linked account`,
    });

    return true;
  };

  const addDebt = (debt: Omit<DebtItem, 'id' | 'createdAt'>): DebtItem => {
    const created = dataService.addDebt(debt);
    setDebts(dataService.getDebts());
    if (isSupabaseConfigured) {
      SupabaseService.createDebt(debt).then((sbDebt) => {
        if (sbDebt) {
          setDebts((prev) => prev.map((d) => (d.id === created.id ? { ...d, id: sbDebt.id } : d)));
        }
      }).catch(console.error);
    }
    return created;
  };

  const updateDebt = (id: string, updates: Partial<Omit<DebtItem, 'id' | 'createdAt'>>): DebtItem | null => {
    const updated = dataService.updateDebt(id, updates);
    setDebts(dataService.getDebts());
    return updated;
  };

  const deleteDebt = (id: string): boolean => {
    const res = dataService.deleteDebt(id);
    if (res) {
      setDebts(dataService.getDebts());
      if (isSupabaseConfigured) {
        SupabaseService.deleteDebt(id).catch(console.error);
      }
    }
    return res;
  };

  const payDebtInstallment = (debtId: string, amount: number, pocketId: string): boolean => {
    const success = dataService.payDebtInstallment(debtId, amount, pocketId);
    if (success) {
      setDebts(dataService.getDebts());
      setPockets(dataService.getPockets());
      setTransactions(dataService.getTransactions());
      updateUser(dataService.getUser());
      if (isSupabaseConfigured) {
        const pkt = pockets.find((p) => p.id === pocketId);
        SupabaseService.payDebtInstallment(debtId, amount, pocketId, pkt?.name).catch(console.error);
      }
    }
    return success;
  };

  const addAsset = (asset: Omit<AssetItem, 'id' | 'createdAt'>): AssetItem => {
    const created = dataService.addAsset(asset);
    setAssets(dataService.getAssets());
    if (isSupabaseConfigured) {
      SupabaseService.createAsset(asset).then((sbAsset) => {
        if (sbAsset) {
          setAssets((prev) => prev.map((a) => (a.id === created.id ? { ...a, id: sbAsset.id } : a)));
        }
      }).catch(console.error);
    }
    return created;
  };

  const updateAsset = (id: string, updates: Partial<Omit<AssetItem, 'id' | 'createdAt'>>): AssetItem | null => {
    const updated = dataService.updateAsset(id, updates);
    setAssets(dataService.getAssets());
    if (isSupabaseConfigured) {
      SupabaseService.updateAsset(id, updates).catch(console.error);
    }
    return updated;
  };

  const deleteAsset = (id: string): boolean => {
    const res = dataService.deleteAsset(id);
    if (res) {
      setAssets(dataService.getAssets());
      if (isSupabaseConfigured) {
        SupabaseService.deleteAsset(id).catch(console.error);
      }
    }
    return res;
  };

  const setCategoryBudget = (category: Transaction['category'], monthlyLimit: number): CategoryBudget => {
    const res = dataService.setCategoryBudget(category, monthlyLimit);
    setBudgets(dataService.getBudgets());
    if (isSupabaseConfigured) {
      SupabaseService.saveBudget(category, monthlyLimit).catch(console.error);
    }
    return res;
  };

  const deleteCategoryBudget = (category: Transaction['category']): boolean => {
    const res = dataService.deleteCategoryBudget(category);
    if (res) setBudgets(dataService.getBudgets());
    return res;
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt'>): NoteItem => {
    const newNote = dataService.addNote(note);
    setNotes(dataService.getNotes());
    if (isSupabaseConfigured) {
      SupabaseService.createNote(note).then((sbNote) => {
        if (sbNote) {
          setNotes((prev) => prev.map((n) => (n.id === newNote.id ? { ...n, id: sbNote.id } : n)));
        }
      }).catch(console.error);
    }
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Omit<NoteItem, 'id' | 'createdAt'>>): NoteItem | null => {
    const res = dataService.updateNote(id, updates);
    if (res) {
      setNotes(dataService.getNotes());
      if (isSupabaseConfigured) {
        SupabaseService.updateNote(id, updates).catch(console.error);
      }
    }
    return res;
  };

  const deleteNote = (id: string): boolean => {
    const res = dataService.deleteNote(id);
    if (res) {
      setNotes(dataService.getNotes());
      if (isSupabaseConfigured) {
        SupabaseService.deleteNote(id).catch(console.error);
      }
    }
    return res;
  };

  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt'>): WishlistItem => {
    const newItem = dataService.addWishlistItem(item);
    setWishlists((prev) => [newItem, ...prev.filter((w) => w.id !== newItem.id)]);
    if (isSupabaseConfigured) {
      SupabaseService.createWishlist(item).then((sbWish) => {
        if (sbWish) {
          setWishlists((prev) => prev.map((w) => (w.id === newItem.id ? { ...w, id: sbWish.id } : w)));
        }
      }).catch(console.error);
    }
    return newItem;
  };

  const updateWishlistItem = (id: string, updates: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>): WishlistItem | null => {
    const res = dataService.updateWishlistItem(id, updates);
    setWishlists((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    if (isSupabaseConfigured) {
      SupabaseService.updateWishlist(id, updates).catch(console.error);
    }
    return res;
  };

  const deleteWishlistItem = (id: string): boolean => {
    dataService.deleteWishlistItem(id);
    setWishlists((prev) => prev.filter((w) => w.id !== id));
    if (isSupabaseConfigured) {
      SupabaseService.deleteWishlist(id).catch(console.error);
    }
    return true;
  };

  const resetData = () => {
    const isDemo = user?.email === 'smith@example.com';
    if (isDemo) {
      dataService.resetToDefaults();
      setTransactions(INITIAL_TRANSACTIONS);
      setCards(INITIAL_CARDS);
      setPockets(INITIAL_POCKETS);
      setDebts(INITIAL_DEBTS);
      setAssets(INITIAL_ASSETS);
      setBudgets(INITIAL_BUDGETS);
      setNotes(INITIAL_NOTES);
      setWishlists(INITIAL_WISHLISTS);
      setCategories(CATEGORY_SUMMARIES);
      setSelectedPocket(null);
      updateUser(dataService.getUser());
    } else {
      dataService.clearUserData(user.email);
      setTransactions([]);
      setCards([]);
      setPockets(STARTER_POCKETS);
      setDebts([]);
      setAssets([]);
      setBudgets([]);
      setNotes([]);
      setWishlists([]);
      setCategories(CATEGORY_SUMMARIES);
      setSelectedPocket(null);
      dataService.savePockets(STARTER_POCKETS);
      dataService.saveTransactions([]);
      dataService.saveCards([]);
      dataService.saveDebts([]);
      dataService.saveAssets([]);
      dataService.saveBudgets([]);
      dataService.saveNotes([]);
      dataService.saveWishlists([]);
      updateUser({ balance: 0, totalBalance: 0 });
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.title.toLowerCase().includes(query) ||
      tx.category.toLowerCase().includes(query) ||
      (tx.note && tx.note.toLowerCase().includes(query)) ||
      tx.amount.toString().includes(query)
    );
  });

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        cards,
        pockets,
        selectedPocket,
        setSelectedPocket,
        debts,
        assets,
        budgets,
        notes,
        setNotes,
        addNote,
        updateNote,
        deleteNote,
        wishlists,
        setWishlists,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        selectedTransaction,
        setSelectedTransaction,
        searchQuery,
        setSearchQuery,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCard,
        updateCard,
        deleteCard,
        setDefaultCard,
        addPocket,
        updatePocket,
        deletePocket,
        transferToPocket,
        withdrawFromPocket,
        transferBetweenPockets,
        transferMoney,
        withdrawMoney,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebtInstallment,
        addAsset,
        updateAsset,
        deleteAsset,
        setCategoryBudget,
        deleteCategoryBudget,
        filteredTransactions,
        resetData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
