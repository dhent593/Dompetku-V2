'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

export const TransferModal: React.FC = () => {
  const { user } = useAuth();
  const { activeModal, setActiveModal, transferMoney } = useFinance();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (activeModal !== 'transfer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!recipient.trim()) {
      setError('Please enter recipient name or account');
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (num > user.balance) {
      setError(`Insufficient balance. Maximum available: ${formatCurrency(user.balance)}`);
      return;
    }

    const success = transferMoney(recipient.trim(), num, note.trim());
    if (success) {
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setIsSuccess(false);
        setActiveModal(null);
        setRecipient('');
        setAmount('');
        setNote('');
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
              <Send className="w-4 h-4 text-white stroke-[2.2] -rotate-12" />
            </div>
            <h3 className="text-base font-bold">Transfer Money</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-[#10B981] mb-3" />
            <h4 className="text-lg font-bold text-white">Transfer Successful!</h4>
            <p className="text-xs text-[#7B88A6] mt-1">
              Sent {formatCurrency(parseFloat(amount))} to {recipient}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Recipient</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Alice Johnson / @alice"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#7B88A6] font-medium">Amount ($)</label>
                <span className="text-[11px] text-[#7B88A6]">Avail: {formatCurrency(user.balance)}</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
                required
              />
              {/* Quick Pills */}
              <div className="flex items-center space-x-2 mt-2">
                {[20, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="text-[11px] font-medium py-1 px-2.5 rounded-lg bg-[#21283D] border border-[#2A344E] text-[#8E9BB8] hover:text-white hover:border-[#5B4DF9]"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dinner split, gift"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
            >
              Confirm Transfer
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

