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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="cards-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold">{t('payment_methods')}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setIsAdding(false);
                }}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdding ? (
              <div className="flex flex-col space-y-3.5 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7B88A6]">{t('saved_cards')} ({cards.length})</span>
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
                          ? 'bg-[#1C2233] border-[#635BFF]'
                          : 'bg-[#141824] border-[#1E2435] hover:border-[#2E374F]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white">
                          {card.brand}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-bold text-white">{card.cardNumberMask}</span>
                            {card.isDefault && (
                              <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full font-semibold">
                                {t('primary_badge')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#7B88A6]">{card.cardExpiry}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!card.isDefault && (
                          <button
                            onClick={() => setDefaultCard(card.id)}
                            className="text-[11px] text-[#7B88A6] hover:text-white px-2 py-1 rounded bg-[#1C2233] cursor-pointer"
                            title={t('set_default')}
                          >
                            {t('set_default')}
                          </button>
                        )}
                        {cards.length > 1 && (
                          <button
                            onClick={() => deleteCard(card.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Add Card Form */
              <form onSubmit={handleAddCard} className="flex flex-col space-y-3.5 pt-4">
                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('card_number')}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    maxLength={19}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('card_holder')}</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Smith Doe"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('expiry')}</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="08/30"
                      maxLength={5}
                      className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#635BFF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">{t('card_brand')}</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value as any)}
                      className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">Amex</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {t('add_card')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
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
