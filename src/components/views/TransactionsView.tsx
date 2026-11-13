'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  ShoppingBag,
  Wifi,
  ArrowDownLeft,
  Car,
  Building2,
  Utensils,
  Plus,
  X,
  CreditCard,
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

  const renderIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 text-[#10B981] stroke-[2.2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'travel':
        return <Car className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'investment':
        return <Building2 className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-white/90 stroke-[2]" />;
      default:
        return <CreditCard className="w-5 h-5 text-white/90 stroke-[2]" />;
    }
  };

  const grouped = filteredTransactions.reduce((acc, tx) => {
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
    <div className="flex flex-col space-y-4 text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
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
          className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Expandable Search Input */}
      <AnimatePresence>
        {showSearchInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_tx')}
                className="w-full bg-[#161B29] border border-[#222B40] text-white text-xs rounded-xl py-3 pl-9 pr-8 focus:outline-none focus:border-[#5B4DF9] transition-all placeholder:text-[#64728E]"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#64728E] absolute left-3 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#64728E] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Grouped Transaction List */}
      <div className="flex flex-col space-y-5 pt-1">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-[#64728E] text-xs">
            {t('no_tx_found')}
          </div>
        ) : (
          groupOrder.map((grpName) => {
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
                      className="flex items-center justify-between p-4 rounded-[22px] bg-[#161B29] border border-[#20273D] hover:border-[#5B4DF9] hover:bg-[#1A2031] transition-all cursor-pointer group"
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
          })
        )}
      </div>

      {/* Floating Add Transaction Button */}
      <div className="pt-2">
        <button
          onClick={() => setActiveModal('addTx')}
          className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-[20px] bg-[#161B29] border border-[#222B40] hover:border-[#5B4DF9] text-white text-xs font-semibold hover:bg-[#1E253B] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#5B4DF9] stroke-[2.5]" />
          <span>{t('add_custom_tx')}</span>
        </button>
      </div>
    </div>
  );
};
