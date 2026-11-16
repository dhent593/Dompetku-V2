'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, CategorySummary, NavTab, PaymentCard, Pocket, DebtItem, AssetItem, CategoryBudget, NoteItem, WishlistItem } from '@/types';
import { dataService } from '@/lib/dataService';
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
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [pockets, setPockets] = useState<Pocket[]>(INITIAL_POCKETS);
  const [selectedPocket, setSelectedPocket] = useState<Pocket | null>(null);
  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [wishlists, setWishlists] = useState<WishlistItem[]>(INITIAL_WISHLISTS);
  const [categories, setCategories] = useState<CategorySummary[]>(CATEGORY_SUMMARIES);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Sync with persistent local data
    const loadedTx = dataService.getTransactions();
    if (loadedTx && loadedTx.length > 0) {
      setTransactions(loadedTx);
    }
    const loadedCards = dataService.getCards();
    if (loadedCards && loadedCards.length > 0) {
      setCards(loadedCards);
    }
    const loadedPockets = dataService.getPockets();
    if (loadedPockets && loadedPockets.length > 0) {
      setPockets(loadedPockets);
    }
    const loadedDebts = dataService.getDebts();
    if (loadedDebts && loadedDebts.length > 0) {
      setDebts(loadedDebts);
    }
    const loadedAssets = dataService.getAssets();
    if (loadedAssets && loadedAssets.length > 0) {
      setAssets(loadedAssets);
    }
    const loadedBudgets = dataService.getBudgets();
    if (loadedBudgets && loadedBudgets.length > 0) {
      setBudgets(loadedBudgets);
    }
    const loadedNotes = dataService.getNotes();
    if (loadedNotes && loadedNotes.length > 0) {
      setNotes(loadedNotes);
    }
    const loadedWishlists = dataService.getWishlists();
    if (loadedWishlists && loadedWishlists.length > 0) {
      setWishlists(loadedWishlists);
    }
  }, []);

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
    }
    return ok;
  };

  const addCard = (cardData: Omit<PaymentCard, 'id'>): PaymentCard => {
    const newCard = dataService.addCard(cardData);
    setCards(dataService.getCards());
    updateUser(dataService.getUser());
    return newCard;
  };

  const updateCard = (id: string, updates: Partial<Omit<PaymentCard, 'id'>>): PaymentCard | null => {
    const updated = dataService.updateCard(id, updates);
    if (updated) {
      setCards(dataService.getCards());
      updateUser(dataService.getUser());
    }
    return updated;
  };

  const deleteCard = (id: string): boolean => {
    const ok = dataService.deleteCard(id);
    if (ok) {
      setCards(dataService.getCards());
      updateUser(dataService.getUser());
    }
    return ok;
  };

  const setDefaultCard = (id: string): void => {
    dataService.setDefaultCard(id);
    setCards(dataService.getCards());
    updateUser(dataService.getUser());
  };

  const addPocket = (pocketData: Omit<Pocket, 'id' | 'createdAt'>): Pocket => {
    const created = dataService.addPocket(pocketData);
    setPockets(dataService.getPockets());
    setTransactions(dataService.getTransactions());
    updateUser(dataService.getUser());
    return created;
  };

  const updatePocket = (id: string, updates: Partial<Omit<Pocket, 'id' | 'createdAt'>>): Pocket | null => {
    const updated = dataService.updatePocket(id, updates);
    if (updated) {
      setPockets(dataService.getPockets());
      if (selectedPocket && selectedPocket.id === id) {
        setSelectedPocket(updated);
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
    return created;
  };

  const updateDebt = (id: string, updates: Partial<Omit<DebtItem, 'id' | 'createdAt'>>): DebtItem | null => {
    const updated = dataService.updateDebt(id, updates);
    setDebts(dataService.getDebts());
    return updated;
  };

  const deleteDebt = (id: string): boolean => {
    const res = dataService.deleteDebt(id);
    if (res) setDebts(dataService.getDebts());
    return res;
  };

  const payDebtInstallment = (debtId: string, amount: number, pocketId: string): boolean => {
    const success = dataService.payDebtInstallment(debtId, amount, pocketId);
    if (success) {
      setDebts(dataService.getDebts());
      setPockets(dataService.getPockets());
      setTransactions(dataService.getTransactions());
      updateUser(dataService.getUser());
    }
    return success;
  };

  const addAsset = (asset: Omit<AssetItem, 'id' | 'createdAt'>): AssetItem => {
    const created = dataService.addAsset(asset);
    setAssets(dataService.getAssets());
    return created;
  };

  const updateAsset = (id: string, updates: Partial<Omit<AssetItem, 'id' | 'createdAt'>>): AssetItem | null => {
    const updated = dataService.updateAsset(id, updates);
    setAssets(dataService.getAssets());
    return updated;
  };

  const deleteAsset = (id: string): boolean => {
    const res = dataService.deleteAsset(id);
    if (res) setAssets(dataService.getAssets());
    return res;
  };

  const setCategoryBudget = (category: Transaction['category'], monthlyLimit: number): CategoryBudget => {
    const res = dataService.setCategoryBudget(category, monthlyLimit);
    setBudgets(dataService.getBudgets());
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
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Omit<NoteItem, 'id' | 'createdAt'>>): NoteItem | null => {
    const res = dataService.updateNote(id, updates);
    if (res) setNotes(dataService.getNotes());
    return res;
  };

  const deleteNote = (id: string): boolean => {
    const res = dataService.deleteNote(id);
    if (res) setNotes(dataService.getNotes());
    return res;
  };

  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt'>): WishlistItem => {
    const newItem = dataService.addWishlistItem(item);
    setWishlists((prev) => [newItem, ...prev.filter((w) => w.id !== newItem.id)]);
    return newItem;
  };

  const updateWishlistItem = (id: string, updates: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>): WishlistItem | null => {
    const res = dataService.updateWishlistItem(id, updates);
    setWishlists((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    return res;
  };

  const deleteWishlistItem = (id: string): boolean => {
    dataService.deleteWishlistItem(id);
    setWishlists((prev) => prev.filter((w) => w.id !== id));
    return true;
  };

  const resetData = () => {
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
