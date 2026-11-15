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
      setError('Nominal transfer harus lebih besar dari 0');
      return;
    }
    if (num > sourcePocket.balance) {
      setError(`Saldo ${sourcePocket.name} tidak cukup (${formatCurrency(sourcePocket.balance)})`);
      return;
    }

    transferBetweenPockets(sourcePocket.id, destPocket.id, num);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {}

    setFeedbackMsg(`Berhasil memindahkan ${formatCurrency(num)} ke ${destPocket.name}`);
    setAmount('');
    setTimeout(() => {
      setActiveModal(null);
      setFeedbackMsg(null);
    }, 1400);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="movefunds-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-sm">
                  <ArrowRightLeft className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('record_move_title')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">Antar Kantong</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If fewer than 2 pockets exist */}
            {pockets.length < 2 ? (
              <div className="flex flex-col items-center text-center space-y-3 pt-6 pb-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-500 dark:text-[#7B88A6]">
                  <Wallet className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-xs text-slate-600 dark:text-[#7B88A6] leading-relaxed max-w-[240px]">
                  {t('min_two_pockets')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal('addPocket')}
                  className="py-2.5 px-5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {t('add_pocket_btn')} Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
                {/* 1. Kantong Asal (A) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium">
                      {t('source_pocket_label')}
                    </label>
                    {sourcePocket && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">
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
                              ? 'bg-white dark:bg-[#1C2233] border-[#635BFF] ring-1 ring-[#635BFF] shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#111520] border-slate-200 dark:border-[#1E2435]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white pocket-icon-badge [&>svg]:text-white [&>svg]:stroke-white flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            >
                              {renderIcon(p.iconName)}
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-[#7B88A6]">
                            {formatCurrency(p.balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow Divider Indicator */}
                <div className="flex items-center justify-center my-0.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] flex items-center justify-center text-[#635BFF] shadow-xs">
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 2. Kantong Tujuan (B) */}
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">
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
                              ? 'bg-white dark:bg-[#1C2233] border-[#10B981] ring-1 ring-[#10B981] shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#111520] border-slate-200 dark:border-[#1E2435]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white pocket-icon-badge [&>svg]:text-white [&>svg]:stroke-white flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            >
                              {renderIcon(p.iconName)}
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight">
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
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">
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
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
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
                            className="flex-1 text-[11px] font-medium py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] text-slate-700 dark:text-[#8E9BB8] hover:text-slate-900 dark:hover:text-white hover:border-[#635BFF] cursor-pointer text-center transition-colors"
                          >
                            {fraction * 100}%
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setAmount(sourcePocket.balance.toString())}
                        className="flex-1 text-[11px] font-semibold py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-[#1C2233] border border-[#635BFF]/40 text-[#635BFF] hover:text-white hover:bg-[#635BFF] hover:border-[#635BFF] cursor-pointer text-center transition-colors"
                      >
                        {t('all_balance')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Feedback message */}
                {feedbackMsg && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={!sourcePocket || sourcePocket.balance <= 0}
                    className={`flex-1 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-sm ${
                      sourcePocket && sourcePocket.balance > 0
                        ? 'bg-[#635BFF] hover:bg-[#564EE6] cursor-pointer active:scale-95'
                        : 'bg-slate-300 dark:bg-[#273047] text-slate-500 dark:text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {t('confirm_move_funds')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
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
