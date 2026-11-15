'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRightLeft,
  ArrowDown,
  Check,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Landmark,
  Shield,
  Plane,
  Smartphone,
  Heart,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

export const MovePocketFundsModal: React.FC = () => {
  const { activeModal, setActiveModal, pockets, transferBetweenPockets } = useFinance();
  const { t } = useLanguage();

  const isOpen = activeModal === 'movePocketFunds';

  const [sourcePocketId, setSourcePocketId] = useState<string>('');
  const [destPocketId, setDestPocketId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Initialize selected source and destination pockets
  useEffect(() => {
    if (isOpen && pockets.length >= 2) {
      const p1 = pockets[0].id;
      const p2 = pockets[1].id;
      setSourcePocketId(p1);
      setDestPocketId(p2);
      setAmount('');
      setError(null);
      setFeedbackMsg(null);
    }
  }, [isOpen, pockets]);

  // Keep destination pocket valid if source pocket changes
  const handleSourceChange = (newSourceId: string) => {
    setSourcePocketId(newSourceId);
    setError(null);
    if (destPocketId === newSourceId) {
      const nextDest = pockets.find((p) => p.id !== newSourceId);
      if (nextDest) {
        setDestPocketId(nextDest.id);
      }
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Wallet':
        return <Wallet className="w-4 h-4" />;
      case 'Landmark':
        return <Landmark className="w-4 h-4" />;
      case 'Plane':
        return <Plane className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const sourcePocket = pockets.find((p) => p.id === sourcePocketId);
  const destPocket = pockets.find((p) => p.id === destPocketId);
  const availableDestPockets = pockets.filter((p) => p.id !== sourcePocketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePocket || !destPocket) {
      setError('Pilih kantong asal dan tujuan yang valid');
      return;
    }

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Nominal pemindahan tidak valid');
      return;
    }

    if (num > sourcePocket.balance) {
      setError(
        `${t('insufficient_pocket_balance')} (${formatCurrency(sourcePocket.balance)})`
      );
      return;
    }

    const success = transferBetweenPockets(sourcePocket.id, destPocket.id, num);
    if (success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setFeedbackMsg(
        `Berhasil memindahkan ${formatCurrency(num)} dari ${sourcePocket.name} ke ${destPocket.name}!`
      );
      setTimeout(() => {
        setActiveModal(null);
        setFeedbackMsg(null);
        setAmount('');
      }, 1300);
    } else {
      setError('Gagal memproses pemindahan dana');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="movefunds-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="movefunds-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white">
                  <ArrowRightLeft className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {t('record_move_title')}
                  </h3>
                  <span className="text-[11px] text-[#7B88A6]">Antar Kantong</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If fewer than 2 pockets exist */}
            {pockets.length < 2 ? (
              <div className="flex flex-col items-center text-center space-y-3 pt-6 pb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#1C2233] flex items-center justify-center text-[#7B88A6]">
                  <Wallet className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-xs text-[#7B88A6] leading-relaxed max-w-[240px]">
                  {t('min_two_pockets')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal('addPocket')}
                  className="py-2.5 px-5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {t('add_pocket_btn')} Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
                {/* 1. Kantong Asal (A) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#7B88A6] font-medium">
                      {t('source_pocket_label')}
                    </label>
                    {sourcePocket && (
                      <span className="text-[11px] font-semibold text-[#10B981]">
                        Saldo: {formatCurrency(sourcePocket.balance)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                    {pockets.map((p) => {
                      const isSelected = sourcePocketId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSourceChange(p.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1C2233] border-[#635BFF] ring-1 ring-[#635BFF]'
                              : 'bg-[#111520] border-[#1E2435] hover:border-[#2D364D]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            >
                              {renderIcon(p.iconName)}
                            </div>
                            <span className="text-xs font-semibold text-white tracking-tight">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-[#7B88A6]">
                            {formatCurrency(p.balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow Divider Indicator */}
                <div className="flex items-center justify-center my-0.5">
                  <div className="w-7 h-7 rounded-full bg-[#1C2233] border border-[#273047] flex items-center justify-center text-[#635BFF]">
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 2. Kantong Tujuan (B) */}
                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">
                    {t('dest_pocket_label_modal')}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                    {availableDestPockets.map((p) => {
                      const isSelected = destPocketId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setDestPocketId(p.id);
                            setError(null);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1C2233] border-[#10B981] ring-1 ring-[#10B981]'
                              : 'bg-[#111520] border-[#1E2435] hover:border-[#2D364D]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            >
                              {renderIcon(p.iconName)}
                            </div>
                            <span className="text-xs font-semibold text-white tracking-tight">
                              {p.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Nominal Input */}
                <div className="pt-1">
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">
                    {t('amount_label')}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max={sourcePocket?.balance || 0}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder="0"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#635BFF] transition-colors"
                    required
                  />

                  {/* Quick percentage chips */}
                  {sourcePocket && sourcePocket.balance > 0 && (
                    <div className="flex items-center space-x-1.5 mt-2">
                      {[0.25, 0.5, 0.75].map((fraction) => {
                        const calculated = Math.floor(sourcePocket.balance * fraction);
                        return (
                          <button
                            key={fraction}
                            type="button"
                            onClick={() =>
                              setAmount(calculated > 0 ? calculated.toString() : '0')
                            }
                            className="flex-1 text-[11px] font-medium py-1 px-1.5 rounded-lg bg-[#1C2233] border border-[#273047] text-[#8E9BB8] hover:text-white hover:border-[#635BFF] cursor-pointer text-center"
                          >
                            {fraction * 100}%
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setAmount(sourcePocket.balance.toString())}
                        className="flex-1 text-[11px] font-semibold py-1 px-1.5 rounded-lg bg-[#1C2233] border border-[#273047] text-[#635BFF] hover:text-white hover:bg-[#635BFF] hover:border-[#635BFF] cursor-pointer text-center transition-colors"
                      >
                        {t('all_balance')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Feedback message */}
                {feedbackMsg && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={!sourcePocket || sourcePocket.balance <= 0}
                    className={`flex-1 py-3 rounded-xl text-white text-xs font-bold transition-all ${
                      sourcePocket && sourcePocket.balance > 0
                        ? 'bg-[#635BFF] hover:bg-[#564EE6] cursor-pointer shadow-sm active:scale-95'
                        : 'bg-[#273047] text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {t('confirm_move_funds')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
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

