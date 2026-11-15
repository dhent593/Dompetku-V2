'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  Utensils,
  Car,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AddTransactionModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction } = useFinance();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('shopping');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'addTx' || activeModal === 'addIncome' || activeModal === 'addExpense';

  useEffect(() => {
    if (activeModal === 'addIncome') {
      setType('income');
      setCategory('salary');
      setError(null);
    } else if (activeModal === 'addExpense') {
      setType('expense');
      setCategory('shopping');
      setError(null);
    }
  }, [activeModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim()) {
      setError(t('title_label'));
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Nominal tidak valid / Invalid amount');
      return;
    }

    addTransaction({
      title: title.trim(),
      amount: num,
      type,
      category,
      note: note.trim(),
    });

    setActiveModal(null);
    setTitle('');
    setAmount('');
    setNote('');
  };

  const categories: { id: Transaction['category']; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'shopping', label: t('shopping'), icon: ShoppingBag },
    { id: 'bill', label: t('bill'), icon: Wifi },
    { id: 'salary', label: t('salary'), icon: ArrowDownLeft },
    { id: 'food', label: t('food'), icon: Utensils },
    { id: 'travel', label: t('travel'), icon: Car },
    { id: 'investment', label: t('investment'), icon: Building2 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="addtx-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="addtx-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] p-6 shadow-2xl text-slate-900 dark:text-white relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
                    type === 'income' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'
                  }`}
                >
                  {type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {type === 'income' ? t('record_income_title') : t('record_expense_title')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                    {type === 'income' ? 'Uang Masuk (+)' : 'Uang Keluar (-)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 dark:bg-[#111520] p-1 rounded-xl border border-slate-200 dark:border-[#1C2233]">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('shopping');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-[#F43F5E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                  }`}
                >
                  {t('expense_type')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('salary');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-[#10B981] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                  }`}
                >
                  {t('income_type')}
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {t('title_label')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Netflix Subscription"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {t('amount_label')}
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Category Grid */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">
                  {t('category_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`flex items-center space-x-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? type === 'income'
                              ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm font-semibold'
                              : 'bg-[#F43F5E] border-[#F43F5E] text-white shadow-sm font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] border-slate-200 dark:border-[#273047] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-[#7B88A6]'}`} />
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className={`w-full py-3.5 rounded-xl text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm ${
                  type === 'income'
                    ? 'bg-[#10B981] hover:bg-[#059669]'
                    : 'bg-[#F43F5E] hover:bg-[#E11D48]'
                }`}
              >
                {t('save_tx')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
