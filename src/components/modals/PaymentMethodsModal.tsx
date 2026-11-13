'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Plus, Trash2, Check, Shield } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { PaymentCard } from '@/types';

export const PaymentMethodsModal: React.FC = () => {
  const { activeModal, setActiveModal, cards, addCard, deleteCard, setDefaultCard } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('Smith Doe');
  const [expiry, setExpiry] = useState('');
  const [brand, setBrand] = useState<'visa' | 'mastercard' | 'amex'>('visa');

  if (activeModal !== 'paymentMethods') return null;

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
      colorGradient:
        brand === 'visa'
          ? 'from-[#5950FA] via-[#7547FE] to-[#9C38FE]'
          : 'from-[#1E3A8A] via-[#2563EB] to-[#3B82F6]',
    });

    setIsAdding(false);
    setCardNumber('');
    setExpiry('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold">Payment Methods</h3>
          </div>
          <button
            onClick={() => {
              setActiveModal(null);
              setIsAdding(false);
            }}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAdding ? (
          <div className="flex flex-col space-y-3.5 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7B88A6]">Saved Cards ({cards.length})</span>
              <button
                onClick={() => setIsAdding(true)}
                className="text-[#635BFF] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            {/* List of cards */}
            <div className="flex flex-col space-y-2.5 max-h-[260px] overflow-y-auto">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    card.isDefault
                      ? 'bg-[#1E253B] border-[#5B4DF9] shadow-[0_4px_16px_rgba(91,77,249,0.2)]'
                      : 'bg-[#141824] border-[#222B40] hover:border-[#313C59]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center text-[10px] font-bold uppercase tracking-wider">
                      {card.brand}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-white">{card.cardNumberMask}</span>
                        {card.isDefault && (
                          <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full font-semibold">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#7B88A6]">Expires {card.cardExpiry}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefaultCard(card.id)}
                        className="text-[11px] text-[#7B88A6] hover:text-white px-2 py-1 rounded bg-[#20273D] cursor-pointer"
                        title="Set as Default"
                      >
                        Set Default
                      </button>
                    )}
                    {cards.length > 1 && (
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 cursor-pointer"
                        title="Delete Card"
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
              <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 •••• •••• 4242"
                maxLength={19}
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Smith Doe"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="08/30"
                  maxLength={5}
                  className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#5B4DF9]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">Card Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as any)}
                  className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">Amex</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#5B4DF9] to-[#9C38FE] text-white text-xs font-bold shadow-[0_6px_20px_rgba(118,71,254,0.35)] cursor-pointer"
              >
                Save Card
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
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
