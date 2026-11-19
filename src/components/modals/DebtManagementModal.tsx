'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { DebtItem } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const DebtManagementModal: React.FC = () => {
  const { activeModal, setActiveModal, debts, pockets, addDebt, payDebtInstallment, deleteDebt } = useFinance();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [selectedPocketId, setSelectedPocketId] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form New Debt state
  const [newTitle, setNewTitle] = useState('');
  const [newLender, setNewLender] = useState('');
  const [newTotalAmount, setNewTotalAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newInstallmentCount, setNewInstallmentCount] = useState('12');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isOpen = activeModal === 'debtManagement';

  if (!isOpen) return null;

  // Calculations
  const activeDebts = debts.filter((d) => d.status !== 'paid_off');
  const totalRemainingDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  // Helper for due date calculation
  const getDueStatus = (dueDate: string, status: string) => {
    if (status === 'paid_off') {
      return { label: language === 'id' ? 'Lunas' : 'Paid Off', color: 'emerald' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: language === 'id' ? `Terlambat ${Math.abs(diffDays)} hari` : `Overdue ${Math.abs(diffDays)}d`,
        color: 'red',
      };
    }
    if (diffDays === 0) {
      return {
        label: language === 'id' ? 'Jatuh Tempo Hari Ini!' : 'Due Today!',
        color: 'amber',
      };
    }
    if (diffDays <= 7) {
      return {
        label: language === 'id' ? `${diffDays} hari lagi` : `In ${diffDays} days`,
        color: 'amber',
      };
    }
    return {
      label: language === 'id' ? `Tempo: ${dueDate}` : `Due: ${dueDate}`,
      color: 'slate',
    };
  };

  // Submit payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPay) return;

    const amountNum = parseNumberInput(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFeedbackMsg({ text: language === 'id' ? 'Nominal bayar tidak valid' : 'Invalid payment amount', isError: true });
      return;
    }

    const isManualPay = !selectedPocketId || selectedPocketId === 'none';
    let pocketName = language === 'id' ? 'Pembayaran Manual / Tunai' : 'Manual / Cash Payment';

    if (!isManualPay) {
      const pocket = pockets.find((p) => p.id === selectedPocketId);
      if (!pocket || pocket.balance < amountNum) {
        setFeedbackMsg({ text: language === 'id' ? 'Saldo kantong tidak mencukupi' : 'Pocket balance insufficient', isError: true });
        return;
      }
      pocketName = pocket.name;
    }

    const ok = payDebtInstallment(selectedDebtForPay.id, amountNum, selectedPocketId, selectedDebtForPay.title);
    if (ok) {
      if (amountNum >= selectedDebtForPay.remainingAmount) {
        import('canvas-confetti')
          .then((mod) => {
            const confetti = mod.default;
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          })
          .catch(() => {});
      }
      setFeedbackMsg({
        text: isManualPay
          ? language === 'id'
            ? `Berhasil membayar ${formatCurrency(amountNum)} (Tanpa potong kantong)`
            : `Payment of ${formatCurrency(amountNum)} successful (Manual / Cash)`
          : language === 'id'
          ? `Berhasil membayar ${formatCurrency(amountNum)} via ${pocketName}`
          : `Payment of ${formatCurrency(amountNum)} successful via ${pocketName}`,
        isError: false,
      });
      setTimeout(() => {
        setSelectedDebtForPay(null);
        setPayAmount('');
        setFeedbackMsg(null);
      }, 1500);
    } else {
      setFeedbackMsg({ text: language === 'id' ? 'Gagal memproses pembayaran cicilan' : 'Payment failed', isError: true });
    }
  };

  // Submit new debt
  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseNumberInput(newTotalAmount);
    if (!newTitle.trim() || isNaN(amountNum) || amountNum <= 0) {
      setFormError(language === 'id' ? 'Nama hutang dan nominal wajib diisi' : 'Title and amount are required');
      return;
    }
    if (!newDueDate) {
      setFormError(language === 'id' ? 'Tentukan tanggal jatuh tempo' : 'Please select due date');
      return;
    }

    addDebt({
      title: newTitle.trim(),
      lender: newLender.trim() || (language === 'id' ? 'Lainnya' : 'Other'),
      totalAmount: amountNum,
      remainingAmount: amountNum,
      dueDate: newDueDate,
      installmentCount: parseInt(newInstallmentCount) || 12,
      paidInstallments: 0,
      status: 'active',
      reminderNotes: newNotes.trim(),
    });

    setNewTitle('');
    setNewLender('');
    setNewTotalAmount('');
    setNewDueDate('');
    setNewInstallmentCount('12');
    setNewNotes('');
    setFormError(null);
    setActiveTab('list');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="debt-backdrop"
        variants={snappyBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={() => setActiveModal(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-[2px]"
      >
        <motion.div
          key="debt-modal"
          variants={snappyGelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto transform-gpu will-change-transform"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F43F5E] flex items-center justify-center text-white shadow-sm">
                <CreditCard className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'id' ? 'Pencatatan Hutang & Cicilan' : 'Debt & Installments'}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                  {language === 'id' ? 'Kelola tenggat waktu & bayar via kantong' : 'Manage dues & pay from pockets'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Summary Card */}
          <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#111520] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] font-medium block">
                {language === 'id' ? 'Total Sisa Hutang' : 'Total Remaining Debt'}
              </span>
              <span className="text-xl font-black text-[#F43F5E] tracking-tight">
                {formatCurrency(totalRemainingDebt)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] font-medium block">
                {language === 'id' ? 'Hutang Aktif' : 'Active Debts'}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {activeDebts.length} {language === 'id' ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex bg-slate-100 dark:bg-[#111520] p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setSelectedDebtForPay(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'list' && !selectedDebtForPay
                  ? 'bg-white dark:bg-[#1C2233] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Daftar Hutang' : 'Debt List'} ({debts.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('add');
                setSelectedDebtForPay(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-white dark:bg-[#1C2233] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
              }`}
            >
              + {language === 'id' ? 'Catat Hutang' : 'Add Debt'}
            </button>
          </div>

          {/* VIEW 1: PAY INSTALLMENT DRAWER */}
          {selectedDebtForPay ? (
            <div className="flex flex-col space-y-3.5 pt-1">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] font-medium block">
                    {language === 'id' ? 'Pembayaran Cicilan' : 'Pay Installment'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedDebtForPay.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedDebtForPay(null)}
                  className="text-xs text-[#635BFF] font-semibold hover:underline cursor-pointer"
                >
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`text-xs p-2.5 rounded-xl flex items-center space-x-2 ${
                    feedbackMsg.isError
                      ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
                      : 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                  }`}
                >
                  {feedbackMsg.isError ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="flex flex-col space-y-3">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Nominal Pembayaran (Rp)' : 'Payment Amount (Rp)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payAmount}
                    onChange={(e) => setPayAmount(formatNumberInput(e.target.value))}
                    placeholder="e.g. 500.000"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                  {/* Quick Chips */}
                  <div className="flex space-x-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPayAmount(
                          formatNumberInput(
                            Math.round(selectedDebtForPay.totalAmount / (selectedDebtForPay.installmentCount || 1))
                          )
                        )
                      }
                      className="text-[11px] py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      1x {language === 'id' ? 'Cicilan' : 'Installment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayAmount(formatNumberInput(selectedDebtForPay.remainingAmount))}
                      className="text-[11px] py-1 px-2 rounded-lg bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 font-semibold transition-colors"
                    >
                      {language === 'id' ? 'Lunasi Semua' : 'Pay Full'}
                    </button>
                  </div>
                </div>

                {/* Select Pocket */}
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Bayar Melalui Kantong' : 'Pay via Pocket'}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                    {/* Option 1: Jangan potong kantong manapun */}
                    <div
                      onClick={() => setSelectedPocketId('none')}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        selectedPocketId === 'none'
                          ? 'bg-white dark:bg-[#1C2233] ring-2 ring-[#635BFF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#111520]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-[#252E44]">
                          <span className="text-xs">🚫</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {language === 'id' ? 'Jangan potong kantong (Bayar Manual)' : 'Do not deduct from pocket (Manual)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {language === 'id' ? 'Tanpa Potongan' : 'No Deduction'}
                      </span>
                    </div>

                    {pockets.map((pkt) => {
                      const isSelected = selectedPocketId === pkt.id;
                      return (
                        <div
                          key={pkt.id}
                          onClick={() => setSelectedPocketId(pkt.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-[#1C2233] ring-2 ring-[#635BFF] shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#111520]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white pocket-icon-badge [&>svg]:text-white [&>svg]:stroke-white"
                              style={{ backgroundColor: pkt.color }}
                            >
                              <Wallet className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {pkt.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-[#10B981]">
                            {formatCurrency(pkt.balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] !text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
                >
                  <span className="!text-white font-bold">
                    {language === 'id' ? 'Konfirmasi Bayar Cicilan' : 'Confirm Payment'}
                  </span>
                </button>
              </form>
            </div>
          ) : activeTab === 'list' ? (
            /* VIEW 2: DEBT LIST */
            <div className="flex flex-col space-y-3">
              {debts.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'id' ? 'Tidak ada catatan hutang aktif!' : 'No active debts recorded!'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#7B88A6] mt-0.5">
                    {language === 'id' ? 'Keuangan Anda sehat dan terkontrol.' : 'Your finances are clean and clear.'}
                  </p>
                </div>
              ) : (
                debts.map((d) => {
                  const dueInfo = getDueStatus(d.dueDate, d.status);
                  const isPaidOff = d.status === 'paid_off';
                  const percentPaid = Math.min(
                    100,
                    Math.round(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100)
                  );

                  return (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#141824] shadow-xs flex flex-col space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{d.title}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">{d.lender}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              dueInfo.color === 'emerald'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : dueInfo.color === 'red'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                                : dueInfo.color === 'amber'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-[#1C2233] dark:text-slate-300'
                            }`}
                          >
                            {dueInfo.label}
                          </span>
                          <button
                            onClick={() => deleteDebt(d.id)}
                            className="w-6 h-6 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Amounts & Progress */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                            {language === 'id' ? 'Sisa:' : 'Remaining:'}{' '}
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {formatCurrency(d.remainingAmount)}
                            </strong>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {percentPaid}% ({d.paidInstallments || 0}/{d.installmentCount || 12}x)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1E2435] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPaidOff ? 'bg-[#10B981]' : 'bg-[#635BFF]'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      {!isPaidOff && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {language === 'id' ? 'Jatuh tempo:' : 'Due:'} {d.dueDate}
                            </span>
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDebtForPay(d);
                              setPayAmount(
                                formatNumberInput(
                                  Math.min(
                                    d.remainingAmount,
                                    Math.round(d.totalAmount / (d.installmentCount || 1))
                                  )
                                )
                              );
                              setSelectedPocketId(pockets[0]?.id || 'none');
                            }}
                            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] !text-white active:scale-95 transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                          >
                            <span className="!text-white font-bold">
                              {language === 'id' ? 'Bayar / Cicil' : 'Pay'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* VIEW 3: ADD NEW DEBT FORM */
            <form onSubmit={handleAddDebtSubmit} className="flex flex-col space-y-3 pt-1">
              {formError && (
                <div className="text-xs p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Judul / Keperluan Hutang' : 'Debt Title / Purpose'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cicilan Sepeda Motor, Pinjaman Teman"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Pihak Pemberi Pinjaman' : 'Lender / Institution'}
                </label>
                <input
                  type="text"
                  value={newLender}
                  onChange={(e) => setNewLender(e.target.value)}
                  placeholder="e.g. Bank Mandiri, Leasing, Budi Santoso"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Total Hutang (Rp)' : 'Total Amount (Rp)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(formatNumberInput(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Jumlah Tenor Cicilan' : 'Installments'}
                  </label>
                  <input
                    type="number"
                    value={newInstallmentCount}
                    onChange={(e) => setNewInstallmentCount(e.target.value)}
                    placeholder="12"
                    min="1"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Tanggal Jatuh Tempo / Tenggat' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Catatan Pengingat (Opsional)' : 'Reminder Notes'}
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Pembayaran via transfer tanggal 25"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] !text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
              >
                <span className="!text-white font-bold">
                  {language === 'id' ? 'Simpan Catatan Hutang' : 'Save Debt Record'}
                </span>
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
