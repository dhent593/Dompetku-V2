'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  ShoppingBag,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Car,
  Building2,
  Utensils,
  Plus,
  X,
  CreditCard,
  Calendar,
  Filter,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export const TransactionsView: React.FC = () => {
  const {
    filteredTransactions,
    setActiveTab,
    setActiveModal,
    setSelectedTransaction,
    searchQuery,
    setSearchQuery,
  } = useFinance();
  const { t } = useLanguage();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const renderIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'travel':
        return <Car className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'investment':
        return <Building2 className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-white/90 stroke-[2]" />;
      default:
        if (
          tx.iconName === 'ArrowRightLeft' ||
          tx.title?.toLowerCase().includes('transfer') ||
          tx.title?.toLowerCase().includes('pindah')
        ) {
          return <ArrowRightLeft className="w-5 h-5 text-white/90 stroke-[2]" />;
        }
        if (tx.type === 'income' || tx.iconName === 'ArrowDownLeft') {
          return <ArrowDownLeft className="w-5 h-5 text-white/90 stroke-[2]" />;
        }
        if (tx.type === 'expense' || tx.iconName === 'ArrowUpRight') {
          return <ArrowUpRight className="w-5 h-5 text-white/90 stroke-[2]" />;
        }
        return <CreditCard className="w-5 h-5 text-white/90 stroke-[2]" />;
    }
  };

  const finalFiltered = filteredTransactions.filter((tx) => {
    // 1. Period filter (Minggu, Bulan, Tahun)
    if (filterPeriod !== 'all') {
      const txTime = tx.timestamp || (tx.date ? new Date(tx.date).getTime() : Date.now());
      const now = Date.now();
      const diffMs = now - txTime;
      const oneDay = 24 * 60 * 60 * 1000;

      if (filterPeriod === 'week') {
        const isWithin7Days = diffMs <= 7 * oneDay;
        const isGroupWeek = ['TODAY', 'YESTERDAY', 'EARLIER THIS WEEK'].includes(tx.dateGroup);
        if (!isWithin7Days && !isGroupWeek) return false;
      } else if (filterPeriod === 'month') {
        const isWithin30Days = diffMs <= 30 * oneDay;
        const txDate = new Date(txTime);
        const nowDate = new Date();
        const isSameMonth =
          txDate.getMonth() === nowDate.getMonth() &&
          txDate.getFullYear() === nowDate.getFullYear();
        if (!isWithin30Days && !isSameMonth) return false;
      } else if (filterPeriod === 'year') {
        const isWithin365Days = diffMs <= 365 * oneDay;
        const txDate = new Date(txTime);
        const nowDate = new Date();
        const isSameYear = txDate.getFullYear() === nowDate.getFullYear();
        if (!isWithin365Days && !isSameYear) return false;
      }
    }

    // 2. Type filter
    if (filterType !== 'all') {
      if (tx.type !== filterType) return false;
    }

    return true;
  });

  const grouped = finalFiltered.reduce((acc, tx) => {
    const group = tx.dateGroup || 'OLDER';
    if (!acc[group]) acc[group] = [];
    acc[group].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const groupOrder = ['TODAY', 'YESTERDAY', 'EARLIER THIS WEEK', 'OLDER'];
  const groupLabelMap: Record<string, TranslationKey> = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    'EARLIER THIS WEEK': 'earlier_this_week',
    OLDER: 'older',
  };

  return (
    <div className="flex flex-col h-full text-white w-full min-h-0 space-y-3">
      {/* 1. Top Header (Fixed) */}
      <div className="flex items-center justify-between pt-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-white tracking-tight">{t('tx_title')}</h1>

        <button
          onClick={() => setShowSearchInput(!showSearchInput)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer relative ${
            showSearchInput || filterPeriod !== 'all' || filterType !== 'all' || searchQuery
              ? 'bg-[#635BFF] text-white border border-[#635BFF]'
              : 'bg-[#181E2E] border border-[#242E46] text-white/90 hover:bg-[#20283E] active:scale-95'
          }`}
          aria-label="Search & Filter"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
          {(filterPeriod !== 'all' || filterType !== 'all' || searchQuery) && !showSearchInput && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 ring-2 ring-[#0A0D15]" />
          )}
        </button>
      </div>

      {/* Expandable Search Input & Filter Menu (Fixed) */}
      <AnimatePresence>
        {showSearchInput && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="p-3.5 rounded-[22px] bg-[#141824] border border-[#1E2435] flex flex-col space-y-3 shadow-md">
              {/* Search Bar Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_tx')}
                  className="w-full bg-[#1C2233] border border-[#273047] text-white text-xs rounded-xl py-2.5 pl-9 pr-8 focus:outline-none focus:border-[#635BFF] transition-all placeholder:text-[#64728E]"
                  autoFocus
                />
                <Search className="w-4 h-4 text-[#64728E] absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[#64728E] hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Section Header */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] font-semibold text-[#7B88A6] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#635BFF]" />
                  <span>{t('filter_label')}</span>
                </span>

                {(filterPeriod !== 'all' || filterType !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterPeriod('all');
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-[#635BFF] hover:text-[#827CFF] font-medium cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Time Period Filter Pills (Semua, Minggu Ini, Bulan Ini, Tahun Ini) */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: t('filter_all') },
                  { id: 'week', label: t('filter_week') },
                  { id: 'month', label: t('filter_month') },
                  { id: 'year', label: t('filter_year') },
                ].map((item) => {
                  const isActive = filterPeriod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilterPeriod(item.id as any)}
                      className={`py-1.5 px-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center truncate ${
                        isActive
                          ? 'bg-[#635BFF] text-white shadow-sm'
                          : 'bg-[#1C2233] border border-[#273047] text-[#7B88A6] hover:text-white hover:border-[#384566]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Type Filter Pills (Semua, Pemasukan, Pengeluaran) */}
              <div className="flex items-center space-x-2 pt-0.5">
                {[
                  { id: 'all', label: 'Semua Tipe' },
                  { id: 'income', label: '+ Pemasukan' },
                  { id: 'expense', label: '- Pengeluaran' },
                ].map((item) => {
                  const isActive = filterType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilterType(item.id as any)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all text-center ${
                        isActive
                          ? item.id === 'income'
                            ? 'bg-[#10B981] text-white font-semibold'
                            : item.id === 'expense'
                            ? 'bg-[#F43F5E] text-white font-semibold'
                            : 'bg-[#273047] text-white font-semibold'
                          : 'bg-[#1C2233]/70 border border-[#222A3D] text-[#64728E] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Grouped Transaction List (Scrollable Items ONLY) */}
      <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-5 pb-6 sm:pb-8 pt-1 pr-0.5">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-[#64728E] text-xs flex flex-col items-center space-y-3">
            <p>{t('no_tx_found')}</p>
            {(filterPeriod !== 'all' || filterType !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilterPeriod('all');
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#635BFF] hover:text-[#827CFF] font-semibold underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {groupOrder.map((grpName) => {
              const list = grouped[grpName];
              if (!list || list.length === 0) return null;
              const labelKey = groupLabelMap[grpName];
              const displayTitle = labelKey ? t(labelKey) : grpName;

              return (
                <div key={grpName} className="flex flex-col space-y-2.5">
                  <span className="text-[11px] font-bold text-[#7B88A6] uppercase tracking-wider px-1">
                    {displayTitle}
                  </span>

                  <div className="flex flex-col space-y-3">
                    {list.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="flex items-center justify-between p-4 rounded-[22px] bg-[#161B29] border border-[#20273D] hover:border-[#5B4DF9] hover:bg-[#1A2031] transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
                        title="Click to view, edit, or delete"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-[18px] bg-[#21283D] flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            {renderIcon(tx)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white tracking-tight">{tx.title}</h3>
                            <p className="text-xs text-[#667390] mt-0.5">{tx.time}</p>
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
              );
            })}

            {/* Add Transaction Button at bottom of scrollable list */}
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('recordActionSheet')}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-[20px] bg-[#161B29] border border-[#222B40] hover:border-[#635BFF] text-white text-xs font-semibold hover:bg-[#1E253B] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#635BFF] stroke-[2.5]" />
                <span>{t('add_custom_tx')}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
