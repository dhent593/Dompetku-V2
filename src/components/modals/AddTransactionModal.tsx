'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { Transaction } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AddTransactionModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction, pockets } = useFinance();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('food');
  const [selectedPocketId, setSelectedPocketId] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'addTx' || activeModal === 'addIncome' || activeModal === 'addExpense';

  useEffect(() => {
    if (pockets.length > 0) {
      setSelectedPocketId((prev) => (pockets.some((p) => p.id === prev) ? prev : pockets[0].id));
    } else {
      setSelectedPocketId('');
    }
    if (activeModal === 'addIncome') {
      setType('income');
      setCategory('salary');
      setError(null);
    } else if (activeModal === 'addExpense') {
      setType('expense');
      setCategory('food');
      setError(null);
    }
    // Always default to today on open
    setDate(new Date().toISOString().split('T')[0]);
  }, [activeModal, pockets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseNumberInput(amount);
    if (!title.trim()) {
      setError(t('title_label'));
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError(language === 'id' ? 'Nominal tidak valid' : 'Invalid amount');
      return;
    }

    if (pockets.length === 0 || !selectedPocketId) {
      setError(
        language === 'id'
          ? 'Anda harus membuat kantong terlebih dahulu sebelum mencatat transaksi.'
          : 'Please create a pocket first to record transactions.'
      );
      return;
    }

    const pkt = pockets.find((p) => p.id === selectedPocketId);
    if (!pkt) {
      setError(language === 'id' ? 'Kantong tidak ditemukan' : 'Pocket not found');
      return;
    }

    if (type === 'expense' && num > pkt.balance) {
      setError(
        language === 'id'
          ? `Saldo kantong "${pkt.name}" tidak mencukupi (Tersedia: ${formatCurrency(pkt.balance)})`
          : `Insufficient balance in pocket "${pkt.name}" (Available: ${formatCurrency(pkt.balance)})`
      );
      return;
    }

    addTransaction({
      title: title.trim(),
      amount: num,
      type,
      category,
      note: note.trim(),
      pocketId: selectedPocketId,
      date: date || new Date().toISOString().split('T')[0],
    });

    setActiveModal(null);
    setTitle('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setError(null);
  };

  const expenseCategories: { id: Transaction['category']; label: string }[] = [
    { id: 'food', label: language === 'id' ? 'Makanan & Minuman' : 'Food & Dining' },
    { id: 'shopping', label: language === 'id' ? 'Belanja & Kebutuhan' : 'Shopping & Groceries' },
    { id: 'bill', label: language === 'id' ? 'Tagihan & Utilitas (Listrik, Air, Wifi)' : 'Bills & Utilities' },
    { id: 'travel', label: language === 'id' ? 'Transportasi & Perjalanan' : 'Transportation & Travel' },
    { id: 'entertainment', label: language === 'id' ? 'Hiburan, Langganan & Hobi' : 'Entertainment & Hobbies' },
    { id: 'health', label: language === 'id' ? 'Kesehatan & Medis' : 'Health & Medical' },
    { id: 'education', label: language === 'id' ? 'Pendidikan & Kursus' : 'Education & Courses' },
    { id: 'family', label: language === 'id' ? 'Kebutuhan Rumah & Keluarga' : 'Household & Family' },
    { id: 'gift', label: language === 'id' ? 'Hadiah, Donasi & Sedekah' : 'Gifts & Donations' },
    { id: 'investment', label: language === 'id' ? 'Investasi & Tabungan' : 'Investments' },
    { id: 'transfer', label: language === 'id' ? 'Transfer Keluar' : 'Transfer Out' },
    { id: 'other', label: language === 'id' ? 'Lain-lain' : 'Others' },
  ];

  const incomeCategories: { id: Transaction['category']; label: string }[] = [
    { id: 'salary', label: language === 'id' ? 'Gaji & Upah Bulanan' : 'Salary & Wages' },
    { id: 'investment', label: language === 'id' ? 'Hasil Investasi & Dividen' : 'Investment Profits' },
    { id: 'gift', label: language === 'id' ? 'Bonus, THR & Hadiah' : 'Bonus & Gifts' },
    { id: 'transfer', label: language === 'id' ? 'Transfer Masuk' : 'Transfer In' },
    { id: 'other', label: language === 'id' ? 'Lain-lain' : 'Others' },
  ];

  const selectedPocket = pockets.find((p) => p.id === selectedPocketId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="addtx-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[2px]"
        >
          <motion.div
            key="addtx-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#121622] p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-[#222A3E] text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto scrollbar-none transform-gpu will-change-transform"
          >
            {/* Header: Clean & Typographic */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1E2538]">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xs ${
                    type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {language === 'id'
                      ? type === 'income'
                        ? 'Catat Pemasukan'
                        : 'Catat Pengeluaran'
                      : type === 'income'
                      ? 'Record Income'
                      : 'Record Expense'}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                    {language === 'id' ? 'Arus kas keuangan' : 'Financial cash flow'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-3.5">
              {/* Type Switcher: iOS/Fintech Segmented Control */}
              <div className="flex bg-slate-100 dark:bg-[#0B0E17] p-1 rounded-2xl border border-slate-200/60 dark:border-[#1E2538]">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('food');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-white dark:bg-[#1C2233] text-rose-500 dark:text-rose-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                  }`}
                >
                  <span>{t('expense_type')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('salary');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-white dark:bg-[#1C2233] text-emerald-500 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
                  }`}
                >
                  <span>{t('income_type')}</span>
                </button>
              </div>

              {/* Nominal Input (Thousand Dot Separator) */}
              <div>
                <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block mb-1">
                  {t('amount_label')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
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
                    className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Judul Transaksi */}
              <div>
                <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block mb-1">
                  {t('title_label')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    type === 'income'
                      ? 'e.g. Gaji Bulanan, Bonus Proyek'
                      : 'e.g. Belanja Bulanan, Makan Siang'
                  }
                  className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                  required
                />
              </div>

              {/* Tanggal Transaksi (Manual Date Picker) */}
              <div>
                <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Tanggal Transaksi' : 'Transaction Date'}
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Dropdown Pilihan Kantong */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block">
                    {type === 'income'
                      ? language === 'id'
                        ? 'Masukan Ke Kantong'
                        : 'Deposit To Pocket'
                      : language === 'id'
                      ? 'Potong Dari Kantong'
                      : 'Deduct From Pocket'}
                  </label>
                  {selectedPocket && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">
                      Saldo: {formatCurrency(selectedPocket.balance)}
                    </span>
                  )}
                </div>

                {pockets.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                      {language === 'id'
                        ? 'Belum ada kantong. Buat kantong dulu yuk!'
                        : 'No pockets found. Please create one!'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addPocket')}
                      className="px-2.5 py-1 rounded-lg bg-[#635BFF] hover:bg-[#564EE6] text-white text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      + {language === 'id' ? 'Buat' : 'Create'}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedPocketId}
                      onChange={(e) => {
                        setSelectedPocketId(e.target.value);
                        setError(null);
                      }}
                      className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                    >
                      {pockets.map((pkt) => (
                        <option
                          key={pkt.id}
                          value={pkt.id}
                          className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1"
                        >
                          {pkt.name} — Saldo: {formatCurrency(pkt.balance)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown Kategori */}
              <div>
                <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block mb-1.5">
                  {t('category_label')}
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                  >
                    {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1"
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Catatan (Opsional) */}
              <div>
                <label className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Catatan (Opsional)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Pembelian di kasir / transfer"
                  className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tombol Simpan Transaksi (Brand Primary #635BFF) */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all shadow-sm cursor-pointer mt-1"
              >
                <span className="text-white font-bold">{t('save_tx')}</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
