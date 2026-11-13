'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, CategorySummary, NavTab } from '@/types';
import { dataService } from '@/lib/dataService';
import { CATEGORY_SUMMARIES, INITIAL_TRANSACTIONS } from '@/lib/dummyData';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  categories: CategorySummary[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addTransaction: (tx: {
    title: string;
    category: Transaction['category'];
    amount: number;
    type: 'income' | 'expense';
    note?: string;
  }) => Transaction;
  transferMoney: (recipient: string, amount: number, note?: string) => boolean;
  withdrawMoney: (amount: number, bankName?: string) => boolean;
  filteredTransactions: Transaction[];
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>(CATEGORY_SUMMARIES);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Load initial transactions
    const loaded = dataService.getTransactions();
    setTransactions(loaded);
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
    setCategories(CATEGORY_SUMMARIES);
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
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        searchQuery,
        setSearchQuery,
        addTransaction,
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
