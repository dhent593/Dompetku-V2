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
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, updateTransaction, deleteTransaction } = useFinance();
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
    { id: 'shopping', label: 'Shopping' },
    { id: 'bill', label: 'Bill' },
    { id: 'salary', label: 'Salary' },
    { id: 'food', label: 'Food' },
    { id: 'travel', label: 'Travel' },
    { id: 'investment', label: 'Investment' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'other', label: 'Other' },
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
                {isEditing ? 'Edit Transaction' : 'Transaction Details'}
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
                      <span>Date & Time</span>
                    </span>
                    <span className="font-medium text-white">{selectedTransaction.date}, {selectedTransaction.time}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1C2233]/60">
                    <span className="text-[#7B88A6] flex items-center space-x-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card Used</span>
                    </span>
                    <span className="font-mono text-white">{selectedTransaction.cardNumber || '.... 3245'}</span>
                  </div>

                  {selectedTransaction.note && (
                    <div className="flex flex-col p-3 rounded-xl bg-[#1C2233]/60 space-y-1">
                      <span className="text-[#7B88A6] flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Note</span>
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
                      <span>Delete this transaction?</span>
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      Your balance will automatically adjust accordingly.
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Cancel
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
                      <span>Edit Record</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Delete</span>
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
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      type === 'income' ? 'bg-[#10B981] text-white' : 'text-[#7B88A6]'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Category</label>
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
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Note</label>
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
                    Save Changes
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-3 px-4 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
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
