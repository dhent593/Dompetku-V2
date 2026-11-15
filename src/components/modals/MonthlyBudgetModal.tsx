'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Target,
  ShoppingBag,
  Wifi,
  Car,
  Building2,
  Utensils,
  Film,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Check,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction, CategoryBudget } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const MonthlyBudgetModal: React.FC = () => {
  const { activeModal, setActiveModal, budgets, setCategoryBudget, transactions } = useFinance();
  const { language } = useLanguage();

  const [editingCategory, setEditingCategory] = useState<Transaction['category'] | null>(null);
  const [limitInput, setLimitInput] = useState<string>('');

  const isOpen = activeModal === 'monthlyBudget';
  if (!isOpen) return null;

  // Filter this month's expense transactions
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions.filter((tx) => {
    return tx.type === 'expense' && tx.date.startsWith(currentMonthStr);
  });

  // Calculate actual spending per category
  const spendingByCategory: Record<string, number> = {};
  currentMonthExpenses.forEach((tx) => {
    spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
  });

  // All trackable budget categories
  const trackableCategories: { id: Transaction['category']; nameId: string; nameEn: string; icon: any }[] = [
    { id: 'food', nameId: 'Makanan & Minuman', nameEn: 'Food & Dining', icon: Utensils },
    { id: 'shopping', nameId: 'Belanja', nameEn: 'Shopping', icon: ShoppingBag },
    { id: 'bill', nameId: 'Tagihan & Utilitas', nameEn: 'Bills & Utilities', icon: Wifi },
    { id: 'travel', nameId: 'Transportasi & Perjalanan', nameEn: 'Travel & Commute', icon: Car },
    { id: 'entertainment', nameId: 'Hiburan', nameEn: 'Entertainment', icon: Film },
    { id: 'investment', nameId: 'Investasi', nameEn: 'Investment', icon: Building2 },
  ];

  // Overall totals
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalActualSpent = Object.values(spendingByCategory).reduce((sum, val) => sum + val, 0);
  const totalRemaining = Math.max(0, totalBudgetLimit - totalActualSpent);
  const totalPercent = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalActualSpent / totalBudgetLimit) * 100)) : 0;

  const handleSaveBudget = (cat: Transaction['category']) => {
    const num = parseFloat(limitInput);
    if (!isNaN(num) && num > 0) {
      setCategoryBudget(cat, num);
    }
    setEditingCategory(null);
    setLimitInput('');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="budget-backdrop"
        variants={snappyBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          key="budget-modal"
          variants={snappyGelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2435]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-sm">
                <Target className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'id' ? 'Budgeting Bulanan' : 'Monthly Budgeting'}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                  {language === 'id' ? 'Batas anggaran & kontrol pengeluaran' : 'Spending limits & budget control'}
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

          {/* Overall Budget Progress Card */}
          <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#111520] border border-slate-200 dark:border-[#1C2233]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-[#7B88A6] font-medium">
                {language === 'id' ? 'Pengeluaran Bulan Ini' : 'This Month Spent'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalActualSpent)} / {formatCurrency(totalBudgetLimit)}
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-[#1E2435] rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalPercent > 90 ? 'bg-red-500' : totalPercent > 70 ? 'bg-amber-500' : 'bg-[#10B981]'
                }`}
                style={{ width: `${totalPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#7B88A6] mt-2 font-medium">
              <span>{totalPercent}% {language === 'id' ? 'terpakai' : 'spent'}</span>
              <span>
                {language === 'id' ? 'Sisa Budget:' : 'Remaining:'}{' '}
                <strong className={totalRemaining > 0 ? 'text-emerald-600 dark:text-[#10B981]' : 'text-red-500'}>
                  {formatCurrency(totalRemaining)}
                </strong>
              </span>
            </div>
          </div>

          {/* Category Budgets List */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'id' ? 'Alokasi Batas Anggaran per Kategori' : 'Category Budget Allocation'}
            </h4>

            {trackableCategories.map((cat) => {
              const Icon = cat.icon;
              const budget = budgets.find((b) => b.category === cat.id);
              const limit = budget ? budget.monthlyLimit : 0;
              const spent = spendingByCategory[cat.id] || 0;
              const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const isOverBudget = limit > 0 && spent > limit;
              const isEditing = editingCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] shadow-xs flex flex-col space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {cat[language === 'id' ? 'nameId' : 'nameEn']}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-[#7B88A6]">
                          {language === 'id' ? 'Terpakai' : 'Spent'}: {formatCurrency(spent)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isOverBudget && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 flex items-center space-x-0.5">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          <span>Over</span>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingCategory(null);
                          } else {
                            setEditingCategory(cat.id);
                            setLimitInput(limit.toString());
                          }
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1C2233] text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={language === 'id' ? 'Atur Limit' : 'Set Limit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Limit Edit */}
                  {isEditing ? (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="number"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        placeholder="Limit Rp"
                        className="flex-1 bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF]"
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.id)}
                        className="py-1.5 px-3 rounded-xl bg-[#635BFF] !text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 dark:text-[#7B88A6]">
                          {language === 'id' ? 'Batas:' : 'Limit:'}{' '}
                          <strong className="text-slate-800 dark:text-white">
                            {limit > 0 ? formatCurrency(limit) : (language === 'id' ? 'Belum diatur' : 'Not set')}
                          </strong>
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {limit > 0 ? `${percent}%` : '-'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1E2435] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-[#10B981]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
