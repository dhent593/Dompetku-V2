'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Edit3,
  Check,
  ShoppingBag,
  Wifi,
  ArrowDownLeft,
  Car,
  Building2,
  Utensils,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

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

  if (!selectedTransaction) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <h3 className="text-base font-bold">
            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
          </h3>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setIsEditing(false);
            }}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div className="flex flex-col space-y-4 pt-4">
            {/* Amount Badge */}
            <div className="flex flex-col items-center py-3 bg-[#111522] rounded-2xl border border-[#1E253A]">
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

            {/* Info rows */}
            <div className="flex flex-col space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E253B]/50">
                <span className="text-[#7B88A6] flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date & Time</span>
                </span>
                <span className="font-medium text-white">{selectedTransaction.date}, {selectedTransaction.time}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E253B]/50">
                <span className="text-[#7B88A6] flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card Used</span>
                </span>
                <span className="font-mono text-white">{selectedTransaction.cardNumber || '.... 3245'}</span>
              </div>

              {selectedTransaction.note && (
                <div className="flex flex-col p-3 rounded-xl bg-[#1E253B]/50 space-y-1">
                  <span className="text-[#7B88A6] flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Note</span>
                  </span>
                  <span className="text-white/90">{selectedTransaction.note}</span>
                </div>
              )}
            </div>

            {/* Delete Confirmation prompt */}
            {showDeleteConfirm ? (
              <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-2xl flex flex-col space-y-2 mt-2">
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
                    className="flex-1 py-2 rounded-xl bg-[#21283D] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Action Buttons: Edit and Delete */
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#20273D] border border-[#2B3550] hover:border-[#5B4DF9] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#5B4DF9]" />
                  <span>Edit Record</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSaveEdit} className="flex flex-col space-y-3 pt-4">
            {/* Income / Expense toggle */}
            <div className="flex bg-[#1F263A] p-1 rounded-xl border border-[#2B3550]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  type === 'expense' ? 'bg-[#5B4DF9] text-white' : 'text-[#7B88A6]'
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
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
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
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
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
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-3 px-4 rounded-2xl bg-[#20273D] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

