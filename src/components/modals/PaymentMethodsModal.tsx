'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const PaymentMethodsModal: React.FC = () => {
  const { activeModal, setActiveModal, cards, addCard, deleteCard, setDefaultCard } = useFinance();
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('Smith Doe');
  const [expiry, setExpiry] = useState('');
  const [brand, setBrand] = useState<'visa' | 'mastercard' | 'amex'>('visa');

  const isOpen = activeModal === 'paymentMethods';

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 4) return;

    const last4 = cleanNum.slice(-4);
    const mask = `.... ${last4}`;

    addCard({
      cardHolder: cardHolder.trim() || 'Smith Doe',
      cardNumberMask: mask,
      cardExpiry: expiry.trim() || '12/28',
      brand,
      isDefault: cards.length === 0,
    });

    setIsAdding(false);
    setCardNumber('');
    setExpiry('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cards-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="cards-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] p-6 shadow-2xl text-slate-900 dark:text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('payment_methods')}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setIsAdding(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdding ? (
              <div className="flex flex-col space-y-3.5 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#7B88A6]">{t('saved_cards')} ({cards.length})</span>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="text-[#635BFF] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('add_card')}</span>
                  </button>
                </div>

                {/* List of cards */}
                <div className="flex flex-col space-y-2.5 max-h-[260px] overflow-y-auto">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        card.isDefault
                          ? 'bg-white dark:bg-[#1C2233] border-[#635BFF] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#141824] border-slate-200 dark:border-[#1E2435] hover:border-slate-300 dark:hover:border-[#2E374F]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-7 rounded-md bg-[#635BFF] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">
                          {card.brand}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white font-mono">{card.cardNumberMask}</p>
                          <p className="text-[10px] text-slate-500 dark:text-[#7B88A6]">Exp: {card.cardExpiry}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {card.isDefault ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                            {t('primary_badge')}
                          </span>
                        ) : (
                          <button
                            onClick={() => setDefaultCard(card.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer"
                          >
                            {t('set_default')}
                          </button>
                        )}
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddCard} className="flex flex-col space-y-3.5 pt-4">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">{t('card_holder')}</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">{t('card_number')}</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4123 4567 8910 1112"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">{t('expiry')}</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">{t('card_brand')}</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">Amex</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    {t('save_changes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
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
