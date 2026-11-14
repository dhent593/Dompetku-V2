'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Wallet,
  Landmark,
  Plane,
  Smartphone,
  Heart,
  ShoppingBag,
  Car,
  Home as HomeIcon,
  Briefcase,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Utensils,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    pockets,
    setSelectedPocket,
    setActiveTab,
    setActiveModal,
    setSelectedTransaction,
  } = useFinance();
  const { language, t } = useLanguage();
  const [liveDate, setLiveDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setLiveDate(formatted);
  }, [language]);

  // Dynamic monthly income and expense
  const thisMonthIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const thisMonthExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const renderTxIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 text-white stroke-[2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 text-white stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 text-[#10B981] stroke-[2.2]" />;
      case 'travel':
        return <Car className="w-5 h-5 text-white stroke-[2]" />;
      case 'investment':
        return <Building2 className="w-5 h-5 text-white stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-white stroke-[2]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-white stroke-[2]" />;
    }
  };

  const getTranslatedCategory = (cat: string) => {
    if (cat === 'shopping') return t('shopping');
    if (cat === 'bill') return t('bill');
    if (cat === 'salary') return t('salary');
    if (cat === 'travel') return t('travel');
    if (cat === 'investment') return t('investment');
    if (cat === 'food') return t('food');
    return cat;
  };

  const renderPocketIcon = (name: string) => {
    switch (name) {
      case 'Wallet':
        return <Wallet className="w-3.5 h-3.5" />;
      case 'Landmark':
        return <Landmark className="w-3.5 h-3.5" />;
      case 'Plane':
        return <Plane className="w-3.5 h-3.5" />;
      case 'Smartphone':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'Heart':
        return <Heart className="w-3.5 h-3.5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Car':
        return <Car className="w-3.5 h-3.5" />;
      case 'Home':
        return <HomeIcon className="w-3.5 h-3.5" />;
      case 'Briefcase':
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <Shield className="w-3.5 h-3.5" />;
    }
  };

  const displayTransactions = transactions.slice(0, 3);

  return (
    <div className="flex flex-col space-y-6 text-white w-full">
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">{t('welcome_back')}</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-[#161B26] border border-[#23293A] flex items-center justify-center text-white/90 hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 2. Main Balance Solid Card */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15">
        <div className="relative z-10 flex flex-col justify-between space-y-3.5">
          {/* Card Top: Label & Live Date */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 font-medium tracking-wide">
              {t('total_balance_available')}
            </span>
            <span className="text-[11px] font-medium text-white/90 tracking-wide bg-white/15 px-2.5 py-0.5 rounded-full">
              {liveDate || (language === 'id' ? 'Hari ini' : 'Today')}
            </span>
          </div>

          {/* Card Middle: Big Balance */}
          <div>
            <div className="text-3xl sm:text-[36px] font-extrabold text-white tracking-tight">
              {formatCurrency(user.balance)}
            </div>
          </div>

          {/* Card Bottom: Rincian Pemasukan & Pengeluaran Bulan Ini */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            {/* Pemasukan */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#34D399] stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('monthly_income')}
                </span>
                <span className="font-bold text-white text-[12px] sm:text-[13px] tracking-tight">
                  +{formatCurrency(thisMonthIncome)}
                </span>
              </div>
            </div>

            <div className="h-7 w-px bg-white/15" />

            {/* Pengeluaran */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-red-200 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('monthly_expense')}
                </span>
                <span className="font-bold text-white text-[12px] sm:text-[13px] tracking-tight">
                  -{formatCurrency(thisMonthExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Kantong Saya (My Pockets) */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">{t('my_pockets')}</h2>
          <button
            onClick={() => setActiveModal('addPocket')}
            className="text-xs text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer font-medium flex items-center space-x-1"
          >
            <span>{t('add_pocket_btn')}</span>
          </button>
        </div>

        {/* Horizontal Scrollable Pocket Cards */}
        <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none snap-x -mx-1 px-1">
          {pockets.map((pocket) => {
            const progressPercent = Math.min(
              100,
              Math.max(0, Math.round((pocket.balance / (pocket.targetAmount || 1)) * 100))
            );
            return (
              <div
                key={pocket.id}
                onClick={() => setSelectedPocket(pocket)}
                className="min-w-[165px] sm:min-w-[175px] max-w-[190px] flex-shrink-0 snap-start p-3.5 rounded-[20px] bg-[#141824] border border-[#1E2435] hover:border-[#2D364D] hover:bg-[#181D2B] transition-all cursor-pointer flex flex-col justify-between group shadow-sm active:scale-[0.98]"
                title={pocket.name}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="w-7 h-7 rounded-[10px] flex items-center justify-center text-white"
                      style={{ backgroundColor: pocket.color }}
                    >
                      {renderPocketIcon(pocket.iconName)}
                    </div>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: pocket.color }}
                    >
                      {progressPercent}%
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-tight truncate mt-2.5">
                    {pocket.name}
                  </h3>
                  <p className="text-sm font-bold text-white tracking-tight mt-0.5">
                    {formatCurrency(pocket.balance)}
                  </p>
                  <p className="text-[11px] text-[#7B88A6] mt-0.5 truncate">
                    {t('pocket_target_label')}: {formatCurrency(pocket.targetAmount)}
                  </p>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#1F2637] overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: pocket.color,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {pockets.length === 0 && (
            <div
              onClick={() => setActiveModal('addPocket')}
              className="min-w-[200px] flex-shrink-0 p-4 rounded-[20px] border border-dashed border-[#23293A] hover:border-[#635BFF] flex items-center justify-center text-center cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center space-y-1">
                <Plus className="w-5 h-5 text-[#7B88A6]" />
                <span className="text-xs text-[#7B88A6] font-medium">{t('add_pocket_btn')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Transactions Section */}
      <div className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">{t('transactions')}</h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#7B88A6] hover:text-white transition-colors cursor-pointer font-medium"
          >
            {t('see_all')}
          </button>
        </div>

        {/* Transaction Cards List */}
        <div className="flex flex-col space-y-3">
          {displayTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className="flex items-center justify-between p-4 rounded-[20px] bg-[#141824] border border-[#1E2435] hover:border-[#2D364D] hover:bg-[#181D2B] transition-all cursor-pointer group"
              title="Click to view, edit, or delete"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-[16px] bg-[#1C2233] flex items-center justify-center flex-shrink-0">
                  {renderTxIcon(tx)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {tx.title}
                  </h3>
                  <p className="text-xs text-[#6B7894] mt-0.5">
                    {tx.date.includes('2023-04-19')
                      ? (language === 'id' ? '19 Apr' : 'Apr 19')
                      : tx.date.includes('2023-04-18')
                      ? (language === 'id' ? '18 Apr' : 'Apr 18')
                      : tx.dateGroup}, {tx.time}
                  </p>
                </div>
              </div>

              <div
                className={`text-sm font-bold tracking-tight ${
                  tx.type === 'income' ? 'text-[#10B981]' : 'text-white'
                }`}
              >
                {tx.type === 'income' ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
