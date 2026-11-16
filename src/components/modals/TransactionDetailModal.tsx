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
  Wallet,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, updateTransaction, deleteTransaction, pockets } = useFinance();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('shopping');
  const [editPocketId, setEditPocketId] = useState<string>('main');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (selectedTransaction) {
      setTitle(selectedTransaction.title);
      setAmount(selectedTransaction.amount.toString());
      setType(selectedTransaction.type);
      setCategory(selectedTransaction.category);
      setEditPocketId(selectedTransaction.pocketId || (pockets.length > 0 ? pockets[0].id : ''));
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
      pocketId: editPocketId || (pockets.length > 0 ? pockets[0].id : undefined),
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
          onClick={() => {
            setSelectedTransaction(null);
            setIsEditing(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="detail-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? t('edit_tx') : t('tx_details')}
              </h3>
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setIsEditing(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="flex flex-col space-y-4 pt-4">
                {/* Hero Amount Card */}
                <div className="flex flex-col items-center py-4 px-3 bg-slate-50 dark:bg-[#111520] rounded-2xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#7B88A6] capitalize">
                    {selectedTransaction.category}
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 tracking-tight ${
                      selectedTransaction.type === 'income'
                        ? 'text-[#10B981]'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {selectedTransaction.type === 'income'
                      ? `+${formatCurrency(selectedTransaction.amount)}`
                      : `-${formatCurrency(selectedTransaction.amount)}`}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-white/90 mt-1">
                    {selectedTransaction.title}
                  </span>
                </div>

                {/* Details Rows */}
                <div className="flex flex-col space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1C2233]/60">
                    <span className="text-slate-500 dark:text-[#7B88A6] flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t('date_time')}</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedTransaction.date}, {selectedTransaction.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1C2233]/60">
                    <span className="text-slate-500 dark:text-[#7B88A6] flex items-center space-x-2">
                      <Wallet className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>
                        {selectedTransaction.type === 'income'
                          ? language === 'id'
                            ? 'Kantong Tujuan'
                            : 'Target Pocket'
                          : language === 'id'
                          ? 'Kantong Digunakan'
                          : 'Pocket Used'}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedTransaction.pocketName
                        ? `Kantong ${selectedTransaction.pocketName}`
                        : pockets.find((p) => p.id === selectedTransaction.pocketId)?.name
                        ? `Kantong ${pockets.find((p) => p.id === selectedTransaction.pocketId)?.name}`
                        : pockets[0]
                        ? `Kantong ${pockets[0].name}`
                        : 'Kantong'}
                    </span>
                  </div>

                  {selectedTransaction.note && (
                    <div className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-[#1C2233]/60 space-y-1">
                      <span className="text-slate-500 dark:text-[#7B88A6] flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('note_label')}</span>
                      </span>
                      <span className="text-slate-800 dark:text-white/90 font-medium">
                        {selectedTransaction.note}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delete Confirmation Box */}
                {showDeleteConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-950/40 p-3.5 rounded-2xl flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2 text-xs text-red-700 dark:text-red-300 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span>{t('delete_confirm_title')}</span>
                    </div>
                    <p className="text-[11px] text-red-600 dark:text-red-300/80">
                      {t('delete_confirm_desc')}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        {t('yes_delete')}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#1C2233] dark:hover:bg-[#252E44] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
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
                      className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] text-slate-800 dark:text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>{t('edit_tx')}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      <span>{t('delete_tx')}</span>
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveEdit} className="flex flex-col space-y-3 pt-4">
                <div className="flex bg-slate-100 dark:bg-[#111520] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      type === 'expense'
                        ? 'bg-[#F43F5E] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                    }`}
                  >
                    {t('expense_type')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      type === 'income'
                        ? 'bg-[#10B981] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                    }`}
                  >
                    {t('income_type')}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('title_label')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('amount_label')}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('category_label')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {type === 'income'
                      ? language === 'id'
                        ? 'Kantong Tujuan'
                        : 'Target Pocket'
                      : language === 'id'
                      ? 'Kantong Digunakan'
                      : 'Pocket Used'}
                  </label>
                  <select
                    value={editPocketId}
                    onChange={(e) => setEditPocketId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] transition-colors"
                  >
                    {pockets.map((pkt) => (
                      <option key={pkt.id} value={pkt.id}>
                        Kantong {pkt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('note_label')}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Opsional / Optional note"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-colors"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    {t('save_changes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
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
