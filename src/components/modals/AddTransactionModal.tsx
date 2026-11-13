'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, AlertCircle, ShoppingBag, Wifi, Car, Building2, Utensils, ArrowDownLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Transaction } from '@/types';

export const AddTransactionModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction } = useFinance();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('shopping');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'addTx') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
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
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'bill', label: 'Bill', icon: Wifi },
    { id: 'salary', label: 'Salary', icon: ArrowDownLeft },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'travel', label: 'Travel', icon: Car },
    { id: 'investment', label: 'Investment', icon: Building2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center">
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold">New Record</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
          {/* Type Toggle: Expense / Income */}
          <div className="flex bg-[#1F263A] p-1 rounded-xl border border-[#2B3550]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense' ? 'bg-[#5B4DF9] text-white shadow-sm' : 'text-[#7B88A6] hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#7B88A6] hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div>
            <label className="text-xs text-[#7B88A6] font-medium block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Netflix Subscription"
              className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#7B88A6] font-medium block mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center space-x-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#5B4DF9]/20 border-[#5B4DF9] text-white'
                        : 'bg-[#1F263A] border-[#2B3550] text-[#7B88A6] hover:border-[#3A476C]'
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

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#5B4DF9] to-[#9C38FE] text-white text-xs font-bold tracking-wide shadow-[0_6px_20px_rgba(118,71,254,0.35)] active:scale-95 transition-all mt-2"
          >
            Save Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
};
