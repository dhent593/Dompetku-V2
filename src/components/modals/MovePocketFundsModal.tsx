'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';

export const MovePocketFundsModal: React.FC = () => {
  const { activeModal, setActiveModal, pockets, transferBetweenPockets } = useFinance();
  const { t, language } = useLanguage();

  const isOpen = activeModal === 'movePocketFunds';

  const [sourcePocketId, setSourcePocketId] = useState<string>('');
  const [destPocketId, setDestPocketId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
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
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
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

  const sourcePocket = pockets.find((p) => p.id === sourcePocketId);
  const destPocket = pockets.find((p) => p.id === destPocketId);
  const availableDestPockets = pockets.filter((p) => p.id !== sourcePocketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePocket || !destPocket) {
      setError(language === 'id' ? 'Pilih kantong asal dan tujuan yang valid' : 'Select valid source and destination pockets');
      return;
    }
    const num = parseNumberInput(amount);
    if (isNaN(num) || num <= 0) {
      setError(language === 'id' ? 'Nominal transfer harus lebih besar dari 0' : 'Transfer amount must be greater than 0');
      return;
    }
    if (num > sourcePocket.balance) {
      setError(
        language === 'id'
          ? `Saldo ${sourcePocket.name} tidak cukup (${formatCurrency(sourcePocket.balance)})`
          : `Insufficient balance in ${sourcePocket.name} (${formatCurrency(sourcePocket.balance)})`
      );
      return;
    }

    transferBetweenPockets(sourcePocket.id, destPocket.id, num, note.trim(), date);

    setFeedbackMsg(
      language === 'id'
        ? `Berhasil memindahkan ${formatCurrency(num)} ke ${destPocket.name}`
        : `Successfully moved ${formatCurrency(num)} to ${destPocket.name}`
    );
    setAmount('');
    setNote('');
    setTimeout(() => {
      setActiveModal(null);
      setFeedbackMsg(null);
    }, 1200);
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
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[2px]"
        >
          <motion.div
            key="movefunds-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#121622] p-6 shadow-2xl border border-slate-200/80 dark:border-[#222A3E] text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto scrollbar-none transform-gpu will-change-transform"
          >
            {/* Header: Bersih & Minimalis */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1E2538]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t('record_move_title')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
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
                  + {t('add_pocket_btn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
                {/* 1. Dari Kantong */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('from_pocket')}
                  </label>
                  <div className="relative">
                    <select
                      value={sourcePocketId}
                      onChange={(e) => handleSourceChange(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                    >
                      {pockets.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1.5"
                        >
                          {p.name} — Saldo: {formatCurrency(p.balance)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 2. Ke Kantong */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('to_pocket')}
                  </label>
                  <div className="relative">
                    <select
                      value={destPocketId}
                      onChange={(e) => {
                        setDestPocketId(e.target.value);
                        setError(null);
                      }}
                      className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                    >
                      {availableDestPockets.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1.5"
                        >
                          {p.name} — Saldo: {formatCurrency(p.balance)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 3. Nominal Transfer */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('transfer_amount')}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => {
                        setAmount(formatNumberInput(e.target.value));
                        setError(null);
                      }}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 4. Tanggal Transaksi */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('transfer_date')}
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 5. Keterangan (Opsional) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('notes_optional')}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      language === 'id'
                        ? 'e.g. Alokasi dana tabungan'
                        : 'e.g. Savings allocation'
                    }
                    className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Feedback message */}
                {feedbackMsg && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {/* Tombol Simpan Data (Brand Primary #635BFF) */}
                <button
                  type="submit"
                  disabled={!sourcePocket || sourcePocket.balance <= 0}
                  className={`w-full py-3.5 rounded-2xl text-white text-xs font-bold tracking-wide transition-all shadow-md mt-1 ${
                    sourcePocket && sourcePocket.balance > 0
                      ? 'bg-[#635BFF] hover:bg-[#564EE6] cursor-pointer active:scale-[0.98]'
                      : 'bg-slate-300 dark:bg-[#273047] text-slate-500 dark:text-white/50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-white font-bold">{t('save_data')}</span>
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
