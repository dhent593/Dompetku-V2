'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const TransferModal: React.FC = () => {
  const { user } = useAuth();
  const { activeModal, setActiveModal, transferMoney } = useFinance();
  const { t } = useLanguage();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isOpen = activeModal === 'transfer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!recipient.trim()) {
      setError(t('recipient_label'));
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Nominal tidak valid / Invalid amount');
      return;
    }
    if (num > user.balance) {
      setError(`${t('available_label')}: ${formatCurrency(user.balance)}`);
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="transfer-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="transfer-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <Send className="w-4 h-4 text-white stroke-[2.2] -rotate-12" />
                </div>
                <h3 className="text-base font-bold">{t('transfer_title')}</h3>
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
                <h4 className="text-lg font-bold text-white">{t('transfer_success')}</h4>
                <p className="text-xs text-[#7B88A6] mt-1">
                  {t('transfer_amount_sent')} {formatCurrency(parseFloat(amount))} {t('to_recipient')} {recipient}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">{t('recipient_label')}</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. Alice Johnson / @alice"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#7B88A6] font-medium">{t('amount_label')}</label>
                    <span className="text-[11px] text-[#7B88A6]">{t('available_label')}: {formatCurrency(user.balance)}</span>
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
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                  {/* Quick Pills */}
                  <div className="flex items-center space-x-2 mt-2">
                    {[20, 50, 100, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="text-[11px] font-medium py-1 px-2.5 rounded-lg bg-[#1C2233] border border-[#273047] text-[#8E9BB8] hover:text-white hover:border-[#635BFF] cursor-pointer"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">{t('note_label')}</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Dinner split, gift"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
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
                  {t('confirm_transfer')}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
