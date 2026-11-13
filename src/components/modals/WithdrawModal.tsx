'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const isOpen = activeModal === 'withdraw';

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

  const gelVariants = {
    initial: { opacity: 0, scale: 0.72, y: 35 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 22,
        mass: 0.75,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.18, ease: 'easeIn' },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="withdraw-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="withdraw-modal"
            variants={gelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white stroke-[2]" />
                </div>
                <h3 className="text-base font-bold">Withdraw Funds</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
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
                <h4 className="text-lg font-bold text-white">Withdrawal Processed!</h4>
                <p className="text-xs text-[#7B88A6] mt-1">
                  {formatCurrency(parseFloat(amount))} sent to {bank}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Destination Account</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#635BFF]"
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
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                    required
                  />
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
                  Confirm Withdrawal
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
