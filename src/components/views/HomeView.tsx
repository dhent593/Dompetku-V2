'use client';

import React from 'react';
import { User, Send, QrCode, ShoppingBag, Wifi, ArrowDownLeft, Car, Building2, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const { transactions, setActiveTab, setActiveModal, setSelectedTransaction } = useFinance();

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

  const displayTransactions = transactions.slice(0, 3);

  return (
    <div className="flex flex-col space-y-6 text-white w-full">
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Welcome back</span>
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

      {/* 2. Main Balance Solid Card (Clean, Minimalist, Matte Violet) */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15">
        <div className="relative z-10 flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm tracking-widest text-white/90 font-medium">
              {user.cardNumberMask}
            </span>
          </div>

          <div>
            <span className="text-xs text-white/80 font-normal tracking-wide">Balance</span>
            <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight mt-0.5">
              {formatCurrency(user.balance)}
            </div>
          </div>

          <div className="flex justify-end items-center">
            <span className="text-[11px] font-medium text-white/85 tracking-wider">
              Valid Thru {user.cardExpiry}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons: Transfer & Scan QR (Solid, Crisp, No Garish Gradients) */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => setActiveModal('transfer')}
          className="flex items-center justify-center space-x-3 py-3.5 px-4 rounded-[18px] bg-[#635BFF] hover:bg-[#564EE6] text-white font-semibold text-sm active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <span>Transfer</span>
          <Send className="w-4 h-4 stroke-[2.2] -rotate-12" />
        </button>

        <button
          onClick={() => setActiveModal('scanQr')}
          className="flex items-center justify-center space-x-3 py-3.5 px-4 rounded-[18px] bg-[#161B26] border border-[#23293A] hover:bg-[#1E2433] text-white font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Scan QR</span>
          <QrCode className="w-4 h-4 text-white stroke-[2.2]" />
        </button>
      </div>

      {/* 4. Transactions Section */}
      <div className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Transactions</h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#7B88A6] hover:text-white transition-colors cursor-pointer font-medium"
          >
            See all
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
                  <h3 className="text-sm font-semibold text-white tracking-tight">{tx.title}</h3>
                  <p className="text-xs text-[#6B7894] mt-0.5">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
