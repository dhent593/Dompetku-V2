'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const WithdrawModal: React.FC = () => {
  const { user } = useAuth();
  const { activeModal, setActiveModal, withdrawMoney } = useFinance();
  const { t, language } = useLanguage();
  const [bank, setBank] = useState('BCA (•••• 4120)');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isOpen = activeModal === 'withdraw';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseNumberInput(amount);
    if (isNaN(num) || num <= 0) {
      setError(language === 'id' ? 'Nominal tidak valid' : 'Invalid amount');
      return;
    }
    if (num > user.totalBalance) {
      setError(`Max: ${formatCurrency(user.totalBalance)}`);
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="withdraw-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-[2px]"
        >
          <motion.div
            key="withdraw-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative transform-gpu will-change-transform"
          >
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm">
                  <Landmark className="w-4 h-4 text-white stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('withdraw_title')}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
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
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('withdraw_success')}</h4>
                <p className="text-xs text-slate-500 dark:text-[#7B88A6] mt-1">
                  {formatCurrency(parseFloat(amount))} {t('withdrawal_to')} {bank}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">{t('dest_account')}</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  >
                    <option value="Chase Bank (•••• 8912)">Chase Bank (•••• 8912)</option>
                    <option value="Bank Central Asia (•••• 3390)">BCA - Bank Central Asia (•••• 3390)</option>
                    <option value="Bank Mandiri (•••• 5521)">Bank Mandiri (•••• 5521)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium">{t('amount_label')}</label>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">{t('available_label')}: {formatCurrency(user.totalBalance)}</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      setAmount(formatNumberInput(e.target.value));
                      setError(null);
                    }}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                  {/* Quick Pills */}
                  <div className="flex items-center space-x-2 mt-2">
                    {[50000, 100000, 500000, 1000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(formatNumberInput(val))}
                        className="text-[11px] font-medium py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] text-slate-700 dark:text-[#8E9BB8] hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                      >
                        {formatCurrency(val)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(formatNumberInput(user.totalBalance))}
                      className="text-[11px] font-semibold py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-[#1C2233] text-[#635BFF] hover:text-white hover:bg-[#635BFF] cursor-pointer transition-colors"
                    >
                      {t('all_balance')}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-2.5 rounded-xl">
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
                  {t('confirm_withdraw')}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
