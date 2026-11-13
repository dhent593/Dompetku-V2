'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, ShoppingBag, Wifi, Car, Building2, Utensils, ArrowDownLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AddTransactionModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction } = useFinance();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('shopping');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'addTx';

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="addtx-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <h3 className="text-base font-bold">{t('new_record')}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
              <div className="flex bg-[#111520] p-1 rounded-xl border border-[#1C2233]">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'expense' ? 'bg-[#635BFF] text-white shadow-sm' : 'text-[#7B88A6] hover:text-white'
                  }`}
                >
                  {t('expense_type')}
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'income' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#7B88A6] hover:text-white'
                  }`}
                >
                  {t('income_type')}
                </button>
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('title_label')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Netflix Subscription"
                  className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('amount_label')}</label>
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
                  className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">{t('category_label')}</label>
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
                            ? 'bg-[#635BFF]/20 border-[#635BFF] text-white'
                            : 'bg-[#1C2233] border-[#273047] text-[#7B88A6] hover:border-[#354160]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
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
