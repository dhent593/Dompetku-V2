'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

export const WithdrawModal: React.FC = () => {
  const { user } = useAuth();
  const { activeModal, setActiveModal, withdrawMoney } = useFinance();
  const [bank, setBank] = useState('Chase Bank (•••• 8912)');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (activeModal !== 'withdraw') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    if (num > user.totalBalance) {
      setError(`Cannot withdraw more than total balance: ${formatCurrency(user.totalBalance)}`);
      return;
    }

    const success = withdrawMoney(num, bank);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveModal(null);
        setAmount('');
      }, 1600);
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
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <h3 className="text-base font-bold">Withdraw Funds</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#10B981] mb-3" />
            <h4 className="text-lg font-bold text-white">Withdrawal Processed!</h4>
            <p className="text-xs text-[#7B88A6] mt-1">
              {formatCurrency(parseFloat(amount))} sent to {bank}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Destination Account</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
              >
                <option value="Chase Bank (•••• 8912)">Chase Bank (•••• 8912)</option>
                <option value="Wells Fargo (•••• 4310)">Wells Fargo (•••• 4310)</option>
                <option value="BCA Direct (•••• 7729)">BCA Direct (•••• 7729)</option>
                <option value="PayPal Wallet">PayPal Wallet</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#7B88A6] font-medium">Withdrawal Amount ($)</label>
                <span className="text-[11px] text-[#7B88A6]">Max: {formatCurrency(user.totalBalance)}</span>
              </div>
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
              Confirm Withdrawal
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

