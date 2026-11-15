'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Fingerprint,
  Wifi,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  ArrowLeftRight,
  CheckCircle2,
  Sparkles,
  Target,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';

export const WalletView: React.FC = () => {
  const {
    user,
    pinInput,
    pinError,
    biometricLoading,
    handleKeypadPress,
    handleKeypadBackspace,
    unlockWithBiometrics,
  } = useAuth();
  const { t, language } = useLanguage();
  const { setActiveModal, debts, assets, budgets, transactions } = useFinance();
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeProductToast, setActiveProductToast] = useState<string | null>(null);

  // Quick calculations for the overview widget
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalDebtsRemaining = debts
    .filter((d) => d.status !== 'paid_off')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthSpent = transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetPercent =
    totalBudgetLimit > 0 ? Math.min(100, Math.round((currentMonthSpent / totalBudgetLimit) * 100)) : 0;

  const handleProductClick = (productId: string, productName: string) => {
    if (productId === 'debts') {
      setActiveModal('debtManagement');
      return;
    }
    if (productId === 'assets') {
      setActiveModal('assetManagement');
      return;
    }
    if (productId === 'budget') {
      setActiveModal('monthlyBudget');
      return;
    }
    if (productId === 'scan_qr') {
      setActiveModal('scanQr');
      return;
    }
    if (productId === 'fund_transfer') {
      setActiveModal('transfer');
      return;
    }
    if (productId === 'credit_cards') {
      setActiveModal('paymentMethods');
      return;
    }

    setActiveProductToast(`${productName} module ready`);
    setTimeout(() => {
      setActiveProductToast(null);
    }, 2200);
  };

  const products = [
    {
      id: 'debts' as const,
      name: language === 'id' ? 'Catat & Cicil Hutang' : 'Debt & Loans',
      icon: Banknote,
      badge: debts.filter((d) => d.status !== 'paid_off').length > 0 ? `${debts.filter((d) => d.status !== 'paid_off').length}` : undefined,
      color: 'bg-rose-50 text-[#F43F5E] dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
      id: 'assets' as const,
      name: language === 'id' ? 'Pencatatan Aset' : 'Asset Portfolio',
      icon: Sparkles,
      color: 'bg-violet-50 text-[#635BFF] dark:bg-violet-950/40 dark:text-violet-400',
    },
    {
      id: 'budget' as const,
      name: language === 'id' ? 'Budgeting Bulanan' : 'Monthly Budget',
      icon: Target,
      color: 'bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'scan_qr' as const,
      name: t('scan_qr'),
      icon: QrCode,
      color: 'bg-sky-50 text-[#0EA5E9] dark:bg-sky-950/40 dark:text-sky-400',
    },
    {
      id: 'fund_transfer' as const,
      name: t('fund_transfer'),
      icon: ArrowLeftRight,
      color: 'bg-amber-50 text-[#F59E0B] dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'credit_cards' as const,
      name: t('credit_cards'),
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
  ];

  return (
    <div className="flex flex-col space-y-6 text-slate-900 dark:text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium tracking-wide">{t('welcome_back')}</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>
      </div>

      {/* 2. Hero Security / mPIN Solid Card (Clean, Minimalist, Matte Violet) */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15">
        <div className="flex flex-col items-center justify-center text-center py-2">
          {/* Fingerprint Button */}
          <button
            onClick={unlockWithBiometrics}
            disabled={biometricLoading}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all mb-3 focus:outline-none cursor-pointer"
            aria-label={t('unlock_fingerprint')}
          >
            {biometricLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint className="w-8 h-8 text-white stroke-[1.8]" />
            )}
          </button>

          <span className="text-sm font-semibold text-white tracking-wide">{t('unlock_fingerprint')}</span>
          <span className="text-xs text-white/75 font-normal my-1">{t('or')}</span>
          <span className="text-sm font-semibold text-white tracking-wide">{t('enter_mpin')}</span>

          {/* 4 Digit PIN Dots */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className="flex items-center space-x-3 mt-4 py-2 px-4 rounded-full bg-black/15 hover:bg-black/25 transition-all cursor-pointer"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    isFilled ? 'bg-white shadow-sm scale-110' : 'bg-white/40'
                  }`}
                />
              );
            })}
          </button>

          {pinError && (
            <p className="text-[11px] text-white mt-2 font-medium bg-black/30 py-1 px-3 rounded-full">
              {pinError}
            </p>
          )}
        </div>
      </div>

      {/* Sublinks below card */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500 dark:text-[#7B88A6]">
        <button
          onClick={() => setActiveModal('editProfile')}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {t('not_you')}
        </button>
        <button
          onClick={() => setShowKeypad(true)}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {t('forgot_pin')}
        </button>
      </div>

      {/* In-line Keypad */}
      {showKeypad && (
        <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] rounded-[22px] p-4 flex flex-col items-center shadow-sm">
          <div className="w-full flex justify-between items-center px-2 pb-3 border-b border-slate-200 dark:border-[#1E2435]">
            <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium">{t('numeric_keypad')} (1234)</span>
            <button
              onClick={() => setShowKeypad(false)}
              className="text-xs text-[#635BFF] font-semibold hover:underline cursor-pointer"
            >
              {t('hide')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-3 max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === 'C' || k === '⌫') {
                    handleKeypadBackspace();
                  } else {
                    handleKeypadPress(k);
                  }
                }}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] active:scale-95 text-slate-900 dark:text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2.5 Quick Financial Overview Widget */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Card 1: Aset */}
        <div
          onClick={() => setActiveModal('assetManagement')}
          className="p-3 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-[#2D364D] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] font-medium truncate">
              {language === 'id' ? 'Total Aset' : 'Total Assets'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(totalAssetsValue)}
          </span>
          <span className="text-[10px] text-[#635BFF] font-semibold flex items-center mt-1">
            {language === 'id' ? 'Kelola' : 'Manage'} <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
          </span>
        </div>

        {/* Card 2: Hutang */}
        <div
          onClick={() => setActiveModal('debtManagement')}
          className="p-3 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-[#2D364D] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] font-medium truncate">
              {language === 'id' ? 'Sisa Hutang' : 'Total Debts'}
            </span>
            <Banknote className="w-3.5 h-3.5 text-[#F43F5E]" />
          </div>
          <span className="text-xs font-bold text-[#F43F5E] truncate">
            {formatCurrency(totalDebtsRemaining)}
          </span>
          <span className="text-[10px] text-[#F43F5E] font-semibold flex items-center mt-1">
            {language === 'id' ? 'Cicil' : 'Pay'} <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
          </span>
        </div>

        {/* Card 3: Budget */}
        <div
          onClick={() => setActiveModal('monthlyBudget')}
          className="p-3 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-[#2D364D] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] font-medium truncate">
              {language === 'id' ? 'Budget Bln Ini' : 'Monthly Budget'}
            </span>
            <Target className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {budgetPercent}% {language === 'id' ? 'Pakai' : 'Spent'}
          </span>
          <span className="text-[10px] text-[#10B981] font-semibold flex items-center mt-1">
            {language === 'id' ? 'Batas' : 'Limits'} <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
          </span>
        </div>
      </div>

      {/* 3. Products Section */}
      <div className="flex flex-col space-y-3 pt-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('products')}</h2>

        <div className="grid grid-cols-3 gap-3">
          {products.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleProductClick(item.id, item.name)}
                className="flex flex-col items-center justify-center p-3.5 rounded-[20px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] text-center hover:border-slate-300 dark:hover:border-[#2D364D] hover:bg-slate-50 dark:hover:bg-[#181D2B] active:scale-95 transition-all group cursor-pointer shadow-xs relative"
              >
                {item.badge && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#F43F5E] text-white text-[9px] font-bold rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
                <div
                  className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-colors ${item.color}`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs text-slate-700 dark:text-[#A0AEC0] font-semibold mt-2.5 leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {activeProductToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1C2233] border border-slate-700 dark:border-[#2B3550] text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center space-x-2 z-50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{activeProductToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
