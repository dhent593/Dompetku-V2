'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, CategorySummary, NavTab, PaymentCard, Pocket } from '@/types';
import { dataService } from '@/lib/dataService';
import { CATEGORY_SUMMARIES, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_POCKETS } from '@/lib/dummyData';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  categories: CategorySummary[];
  cards: PaymentCard[];
  pockets: Pocket[];
  selectedPocket: Pocket | null;
  setSelectedPocket: (pocket: Pocket | null) => void;
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
  }) => Transaction;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'timestamp'>>
  ) => Transaction | null;
  deleteTransaction: (id: string) => boolean;
  addCard: (card: Omit<PaymentCard, 'id'>) => PaymentCard;
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
  }, []);

  const addTransaction = (tx: {
    title: string;
    category: Transaction['category'];
    amount: number;
    type: 'income' | 'expense';
    note?: string;
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
          : 'ArrowUpRight',
    });

    setTransactions(dataService.getTransactions());
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
      updateUser(dataService.getUser());
    }
    return updated;
  };

  const deleteTransaction = (id: string): boolean => {
    const ok = dataService.deleteTransaction(id);
    if (ok) {
      setTransactions(dataService.getTransactions());
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
      note: `Funds withdrawn to linked account`,
    });

    return true;
  };

  const resetData = () => {
    dataService.resetToDefaults();
    setTransactions(INITIAL_TRANSACTIONS);
    setCards(INITIAL_CARDS);
    setPockets(INITIAL_POCKETS);
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
