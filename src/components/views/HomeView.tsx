'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Send, QrCode, ShoppingBag, Wifi, ArrowDownLeft, Car, Building2, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const { transactions, setActiveTab, setActiveModal } = useFinance();

  // Helper for transaction icon
  const renderTxIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 text-[#10B981] stroke-[2.2]" />;
      case 'travel':
        return <Car className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'investment':
        return <Building2 className="w-5 h-5 text-white/90 stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-white/90 stroke-[2]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2]" />;
    }
  };

  // Only take the top 2-3 recent transactions as in reference image
  const displayTransactions = transactions.slice(0, 3);

  return (
    <div className="flex flex-col space-y-6 pb-6 text-white">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-1"
      >
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Welcome back</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveModal('addTx')}
            className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm overflow-hidden"
            aria-label="Profile"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </motion.div>

      {/* 2. Main Balance Gradient Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-br from-[#5950FA] via-[#7547FE] to-[#9C38FE] shadow-[0_16px_36px_-6px_rgba(118,71,254,0.42)] border border-white/10"
      >
        {/* Subtle holographic gradient overlay */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-[155px]">
          {/* Card Top Row: Masked Number */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm tracking-widest text-purple-100/90 font-medium">
              {user.cardNumberMask}
            </span>
          </div>

          {/* Card Middle: Balance */}
          <div>
            <span className="text-xs text-purple-200/80 font-normal tracking-wide">Balance</span>
            <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight mt-0.5">
              {formatCurrency(user.balance)}
            </div>
          </div>

          {/* Card Bottom: Expiry */}
          <div className="flex justify-end items-center">
            <span className="text-[11px] font-medium text-purple-200/90 tracking-wider">
              Valid Thru {user.cardExpiry}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. Action Buttons: Transfer & Scan QR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3.5"
      >
        {/* Transfer Button */}
        <button
          onClick={() => setActiveModal('transfer')}
          className="flex items-center justify-center space-x-3 py-3.5 px-4 rounded-[20px] bg-gradient-to-r from-[#5950FA] to-[#923AFE] text-white font-semibold text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_8px_22px_rgba(118,71,254,0.35)]"
        >
          <span>Transfer</span>
          <Send className="w-4 h-4 stroke-[2.2] -rotate-12" />
        </button>

        {/* Scan QR Button */}
        <button
          onClick={() => setActiveModal('scanQr')}
          className="flex items-center justify-center space-x-3 py-3.5 px-4 rounded-[20px] bg-[#161C2C] border border-[#232C42] text-white font-semibold text-sm hover:bg-[#1E253B] active:scale-[0.98] transition-all"
        >
          <span>Scan QR</span>
          <QrCode className="w-4 h-4 text-white stroke-[2.2]" />
        </button>
      </motion.div>

      {/* 4. Transactions Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col space-y-3 pt-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Transactions</h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#6A7898] hover:text-white transition-colors cursor-pointer font-medium"
          >
            See all
          </button>
        </div>

        {/* Transaction Cards List */}
        <div className="flex flex-col space-y-3">
          {displayTransactions.map((tx) => (
            <motion.div
              key={tx.id}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between p-4 rounded-[22px] bg-[#161B29] border border-[#20273D] hover:border-[#2B3552] transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-[18px] bg-[#21283D] flex items-center justify-center flex-shrink-0 shadow-inner">
                  {renderTxIcon(tx)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">{tx.title}</h3>
                  <p className="text-xs text-[#667390] mt-0.5">
                    {tx.date.includes('2023-04-19') ? '19 Apr' : tx.date.includes('2023-04-18') ? '18 Apr' : tx.dateGroup}, {tx.time}
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
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
