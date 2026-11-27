'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
    } else if (activeModal === 'addExpense' || activeModal === 'addTx') {
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
            className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#121622] p-6 shadow-2xl border border-slate-200/80 dark:border-[#222A3E] text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto scrollbar-none transform-gpu will-change-transform"
          >
            {/* Header: Bersih & Minimalis tanpa badge/pernak-pernik */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1E2538]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'id'
                  ? type === 'income'
                    ? 'Catat Pemasukan'
                    : 'Catat Pengeluaran'
                  : type === 'income'
                  ? 'Record Income'
                  : 'Record Expense'}
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

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 pt-4">
              {/* Field 1: Pilih Kantong Tujuan / Kantong Asal */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {type === 'income' ? t('select_dest_pocket') : t('select_source_pocket')}
                </label>

                {pockets.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                      {language === 'id'
                        ? 'Belum ada kantong. Buat kantong dulu yuk!'
                        : 'No pockets found. Please create one!'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addPocket')}
                      className="px-3 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
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
                      className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                    >
                      {pockets.map((pkt) => (
                        <option
                          key={pkt.id}
                          value={pkt.id}
                          className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1.5"
                        >
                          {pkt.name} — Saldo: {formatCurrency(pkt.balance)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Field 2: Nominal */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('amount_label')}
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

              {/* Field 3: Judul Transaksi */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                      ? (language === 'id' ? 'e.g. Gaji Bulanan, Bonus Proyek' : 'e.g. Monthly Salary, Bonus')
                      : (language === 'id' ? 'e.g. Belanja Bulanan, Makan Siang' : 'e.g. Groceries, Lunch')
                  }
                  className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                  required
                />
              </div>

              {/* Field 4: Pilih Kategori */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('select_category')}
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors cursor-pointer pr-10"
                  >
                    {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white py-1.5"
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 5: Tanggal Transaksi */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'id' ? 'Tanggal Transaksi' : 'Transaction Date'}
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

              {/* Field 6: Catatan (Opsional) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === 'id' ? 'Catatan (Opsional)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={language === 'id' ? 'e.g. Pembelian di kasir / transfer' : 'e.g. Cashier purchase / transfer'}
                  className="w-full bg-slate-50 dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#556380] focus:outline-none focus:border-[#635BFF] focus:bg-white dark:focus:bg-[#1C2336] transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tombol Simpan Data (Brand Primary #635BFF) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-[0.98] transition-all shadow-md cursor-pointer mt-1"
              >
                <span className="text-white font-bold">{t('save_data')}</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
