'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('shopping');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (selectedTransaction) {
      setTitle(selectedTransaction.title);
      setAmount(selectedTransaction.amount.toString());
      setType(selectedTransaction.type);
      setCategory(selectedTransaction.category);
      setNote(selectedTransaction.note || '');
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedTransaction]);

  const isOpen = selectedTransaction !== null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    updateTransaction(selectedTransaction.id, {
      title: title.trim(),
      amount: num,
      type,
      category,
      note: note.trim(),
    });

    setIsEditing(false);
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    if (!selectedTransaction) return;
    deleteTransaction(selectedTransaction.id);
    setShowDeleteConfirm(false);
    setSelectedTransaction(null);
  };

  const categories: { id: Transaction['category']; label: string }[] = [
    { id: 'shopping', label: t('shopping') },
    { id: 'bill', label: t('bill') },
    { id: 'salary', label: t('salary') },
    { id: 'food', label: t('food') },
    { id: 'travel', label: t('travel') },
    { id: 'investment', label: t('investment') },
    { id: 'transfer', label: t('transfer') },
    { id: 'other', label: t('other') },
  ];

  return (
    <AnimatePresence>
      {isOpen && selectedTransaction && (
        <motion.div
          key="detail-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="detail-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <h3 className="text-base font-bold">
                {isEditing ? t('edit_tx') : t('tx_details')}
              </h3>
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setIsEditing(false);
                }}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex flex-col items-center py-3 bg-[#111520] rounded-2xl border border-[#1B2130]">
                  <span className="text-xs text-[#7B88A6] capitalize">{selectedTransaction.category}</span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      selectedTransaction.type === 'income' ? 'text-[#10B981]' : 'text-white'
                    }`}
                  >
                    {selectedTransaction.type === 'income'
                      ? `+${formatCurrency(selectedTransaction.amount)}`
                      : `-${formatCurrency(selectedTransaction.amount)}`}
                  </div>
                  <span className="text-sm font-semibold text-white/90 mt-1">{selectedTransaction.title}</span>
                </div>

                <div className="flex flex-col space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1C2233]/60">
                    <span className="text-[#7B88A6] flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t('date_time')}</span>
                    </span>
                    <span className="font-medium text-white">{selectedTransaction.date}, {selectedTransaction.time}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1C2233]/60">
                    <span className="text-[#7B88A6] flex items-center space-x-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t('card_used')}</span>
                    </span>
                    <span className="font-mono text-white">{selectedTransaction.cardNumber || '.... 3245'}</span>
                  </div>

                  {selectedTransaction.note && (
                    <div className="flex flex-col p-3 rounded-xl bg-[#1C2233]/60 space-y-1">
                      <span className="text-[#7B88A6] flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('note_label')}</span>
                      </span>
                      <span className="text-white/90">{selectedTransaction.note}</span>
                    </div>
                  )}
                </div>

                {showDeleteConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-2xl flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2 text-xs text-red-300 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{t('delete_confirm_title')}</span>
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      {t('delete_confirm_desc')}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {t('yes_delete')}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#1C2233] border border-[#273047] hover:border-[#635BFF] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>{t('edit_tx')}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>{t('delete_tx')}</span>
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveEdit} className="flex flex-col space-y-3 pt-4">
                <div className="flex bg-[#111520] p-1 rounded-xl border border-[#1C2233]">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      type === 'expense' ? 'bg-[#635BFF] text-white' : 'text-[#7B88A6]'
                    }`}
                  >
                    {t('expense_type')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      type === 'income' ? 'bg-[#10B981] text-white' : 'text-[#7B88A6]'
                    }`}
                  >
                    {t('income_type')}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('title_label')}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('amount_label')}</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('category_label')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('note_label')}</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional memo"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {t('save_changes')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-3 px-4 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
