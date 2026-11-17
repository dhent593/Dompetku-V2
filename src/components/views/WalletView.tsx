'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerBackHandler } from '@/hooks/useSystemBackHandler';
import {
  ChevronLeft,
  User,
  WalletCards,
  Receipt,
  TrendingUp,
  Target,
  CreditCard,
  FileText,
  Sparkles,
  Heart,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Pin,
  PinOff,
  ArrowLeftRight,
  Shield,
  Layers,
  Landmark,
  Calendar,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Gift,
  DollarSign,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { NoteItem, WishlistItem, PaymentCard, AssetItem, DebtItem, CategoryBudget, Transaction } from '@/types';

type SubViewType = 'hub' | 'pockets' | 'debts' | 'assets' | 'budgets' | 'bank_accounts' | 'notes' | 'wishlist';

export const WalletView: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const {
    pockets,
    setSelectedPocket,
    debts,
    addDebt,
    payDebtInstallment,
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    budgets,
    setCategoryBudget,
    deleteCategoryBudget,
    transactions,
    cards,
    addCard,
    updateCard,
    deleteCard,
    setDefaultCard,
    notes,
    addNote,
    updateNote,
    deleteNote,
    wishlists,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    setActiveModal,
    setActiveTab,
  } = useFinance();

  // Active Sub-view state
  const [currentSubView, setCurrentSubView] = useState<SubViewType>('hub');

  // Copy feedback and toast state
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-view specific modal states
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddWishlistModal, setShowAddWishlistModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [selectedDebtDetail, setSelectedDebtDetail] = useState<DebtItem | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState<string>('');
  const [debtPayPocketId, setDebtPayPocketId] = useState<string>('');
  const [debtPayError, setDebtPayError] = useState<string | null>(null);

  // Register system back button handler for WalletView sub-views and internal modals
  useEffect(() => {
    return registerBackHandler(() => {
      // 1. Close internal sub-modals if open
      if (selectedDebtDetail) {
        setSelectedDebtDetail(null);
        return true;
      }
      if (showAddCardModal || editingCard) {
        setShowAddCardModal(false);
        setEditingCard(null);
        return true;
      }
      if (showAddNoteModal) {
        setShowAddNoteModal(false);
        return true;
      }
      if (showAddWishlistModal) {
        setShowAddWishlistModal(false);
        return true;
      }
      if (showAddDebtModal) {
        setShowAddDebtModal(false);
        return true;
      }
      if (showAddAssetModal || editingAsset) {
        setShowAddAssetModal(false);
        setEditingAsset(null);
        return true;
      }
      if (showAddBudgetModal || editingBudget) {
        setShowAddBudgetModal(false);
        setEditingBudget(null);
        return true;
      }

      // 2. Return from sub-view to 'hub'
      if (currentSubView !== 'hub') {
        setCurrentSubView('hub');
        return true;
      }

      // 3. Delegate to tab history (which will navigate back to 'home')
      return false;
    });
  }, [
    selectedDebtDetail,
    showAddCardModal,
    editingCard,
    showAddNoteModal,
    showAddWishlistModal,
    showAddDebtModal,
    showAddAssetModal,
    editingAsset,
    showAddBudgetModal,
    editingBudget,
    currentSubView,
  ]);

  // Form states for Asset
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetItem['category']>('investment');
  const [newAssetPurchasePrice, setNewAssetPurchasePrice] = useState('');
  const [newAssetCurrentValue, setNewAssetCurrentValue] = useState('');
  const [newAssetPocketId, setNewAssetPocketId] = useState<string>('none');
  const [newAssetNotes, setNewAssetNotes] = useState('');
  const [newAssetError, setNewAssetError] = useState<string | null>(null);

  // Form states for Budget
  const [newBudgetCategory, setNewBudgetCategory] = useState<Transaction['category']>('food');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Form states for Debt
  const [newDebtTitle, setNewDebtTitle] = useState('');
  const [newDebtLender, setNewLender] = useState('');
  const [newDebtTotal, setNewDebtTotal] = useState('');
  const [newDebtDueDate, setNewDebtDueDate] = useState('');
  const [newDebtInstallments, setNewDebtInstallments] = useState('12');

  // Form states for Card
  const [newCardBank, setNewCardBank] = useState('Bank Mandiri');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(user?.name || 'Smith Doe');
  const [newCardGradient, setNewCardGradient] = useState('from-blue-900 to-indigo-950');

  // Form states for Note
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Catatan');
  const [newNotePinned, setNewNotePinned] = useState(false);

  // Form states for Wishlist
  const [newWishTitle, setNewWishTitle] = useState('');
  const [newWishPrice, setNewWishPrice] = useState('');
  const [newWishDate, setNewWishDate] = useState('');
  const [newWishPriority, setNewWishPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newWishPocketId, setNewWishPocketId] = useState<string>('');
  const [newWishNote, setNewWishNote] = useState('');

  // Filtering states for sub-views
  const [debtFilter, setDebtFilter] = useState<'all' | 'active' | 'paid_off'>('all');
  const [wishlistFilter, setWishlistFilter] = useState<'all' | 'planned' | 'purchased'>('all');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');

  // Calculations for Net Worth & Metrics
  const totalPocketsBalance = pockets.reduce((sum, p) => sum + p.balance, 0);
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalAssetsPurchase = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const assetGain = totalAssetsValue - totalAssetsPurchase;
  const assetGainPercent = totalAssetsPurchase > 0 ? ((assetGain / totalAssetsPurchase) * 100).toFixed(1) : '0';

  const activeDebts = debts.filter((d) => d.status !== 'paid_off');
  const totalDebtsRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalDebtsOriginal = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtsPaid = totalDebtsOriginal - totalDebtsRemaining;

  const netWorth = totalPocketsBalance + totalAssetsValue - totalDebtsRemaining;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthSpent = transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetPercent =
    totalBudgetLimit > 0 ? Math.min(100, Math.round((currentMonthSpent / totalBudgetLimit) * 100)) : 0;

  const totalWishlistPlanned = wishlists.filter((w) => w.status !== 'purchased');
  const totalWishlistNeeded = totalWishlistPlanned.reduce((sum, w) => sum + w.estimatedPrice, 0);
  const topWishlist = wishlists.find((w) => w.status === 'planned') || wishlists[0];
  const topWishSaved = topWishlist?.savedAmount || 0;
  const topWishTarget = topWishlist?.estimatedPrice || 1;
  const topWishProgress = Math.min(100, Math.round((topWishSaved / topWishTarget) * 100));
  const pinnedNote = notes.find((n) => n.isPinned) || notes[0];

  // 1-Click Copy Handler
  const handleCopyAccountNumber = (bankName: string, accNumber: string, holderName?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const copyString = `${accNumber}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(copyString).then(() => {
        setCopiedAccount(accNumber);
        setToastMessage(`Nomor rekening ${bankName} (${accNumber}) berhasil disalin!`);
        setTimeout(() => setCopiedAccount(null), 2000);
        setTimeout(() => setToastMessage(null), 2600);
      }).catch(() => {
        setToastMessage(`Rekening ${bankName}: ${accNumber}`);
        setTimeout(() => setToastMessage(null), 2600);
      });
    } else {
      setToastMessage(`Rekening ${bankName}: ${accNumber}`);
      setTimeout(() => setToastMessage(null), 2600);
    }
  };

  // Add / Edit Card Submission
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim()) return;
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4) || '1234';

    if (editingCard) {
      updateCard(editingCard.id, {
        bankName: newCardBank,
        accountNumber: cleanNum,
        accountHolder: newCardHolder || user?.name || 'Smith Doe',
        cardHolder: newCardHolder || user?.name || 'Smith Doe',
        cardNumberMask: `.... ${last4}`,
      });
      setToastMessage(language === 'id' ? `Rekening ${newCardBank} berhasil diperbarui!` : `Card ${newCardBank} updated!`);
    } else {
      addCard({
        bankName: newCardBank,
        accountNumber: cleanNum,
        accountHolder: newCardHolder || user?.name || 'Smith Doe',
        cardHolder: newCardHolder || user?.name || 'Smith Doe',
        cardNumberMask: `.... ${last4}`,
        cardExpiry: '12/29',
        brand: 'visa',
        isDefault: cards.length === 0,
        colorGradient: newCardGradient,
      });
      setToastMessage(`Rekening ${newCardBank} berhasil ditambahkan!`);
    }
    setNewCardNumber('');
    setEditingCard(null);
    setShowAddCardModal(false);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Add / Edit Asset Submission
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setNewAssetError(null);
    const purchaseNum = parseNumberInput(newAssetPurchasePrice);
    const currentNum = parseNumberInput(newAssetCurrentValue);
    if (!newAssetName.trim() || isNaN(currentNum) || currentNum <= 0) {
      setNewAssetError(
        language === 'id'
          ? 'Nama aset dan nilai sekarang wajib diisi dengan benar'
          : 'Asset name and current value are required'
      );
      return;
    }

    if (editingAsset) {
      updateAsset(editingAsset.id, {
        name: newAssetName.trim(),
        category: newAssetCategory,
        purchasePrice: purchaseNum > 0 ? purchaseNum : currentNum,
        currentValue: currentNum,
        notes: newAssetNotes.trim() || undefined,
      });
      setToastMessage(language === 'id' ? `Aset "${newAssetName}" berhasil diperbarui!` : `Asset "${newAssetName}" updated!`);
    } else {
      const finalPurchasePrice = purchaseNum > 0 ? purchaseNum : currentNum;

      // Validate pocket balance if deducting from a pocket
      if (newAssetPocketId && newAssetPocketId !== 'none') {
        const pocket = pockets.find((p) => p.id === newAssetPocketId);
        if (!pocket) {
          setNewAssetError(language === 'id' ? 'Kantong sumber tidak ditemukan' : 'Funding pocket not found');
          return;
        }
        if (pocket.balance < finalPurchasePrice) {
          setNewAssetError(
            language === 'id'
              ? `Saldo kantong "${pocket.name}" tidak mencukupi (Tersedia: ${formatCurrency(pocket.balance)})`
              : `Insufficient balance in pocket "${pocket.name}" (Available: ${formatCurrency(pocket.balance)})`
          );
          return;
        }
      }

      addAsset({
        name: newAssetName.trim(),
        category: newAssetCategory,
        purchasePrice: finalPurchasePrice,
        currentValue: currentNum,
        purchaseDate: new Date().toISOString().split('T')[0],
        pocketId: newAssetPocketId && newAssetPocketId !== 'none' ? newAssetPocketId : undefined,
        notes: newAssetNotes.trim() || undefined,
      });
      setToastMessage(language === 'id' ? `Aset "${newAssetName}" berhasil ditambahkan!` : `Asset "${newAssetName}" added!`);
    }
    setNewAssetName('');
    setNewAssetPurchasePrice('');
    setNewAssetCurrentValue('');
    setNewAssetPocketId('none');
    setNewAssetNotes('');
    setNewAssetError(null);
    setEditingAsset(null);
    setShowAddAssetModal(false);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Add / Edit Budget Submission
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseNumberInput(newBudgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    setCategoryBudget(newBudgetCategory, limitNum);
    setToastMessage(
      language === 'id'
        ? `Budget kategori "${newBudgetCategory}" berhasil disimpan!`
        : `Budget for "${newBudgetCategory}" saved!`
    );
    setNewBudgetLimit('');
    setEditingBudget(null);
    setShowAddBudgetModal(false);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Add Note Submission
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tag: newNoteTag.trim() || 'Umum',
      isPinned: newNotePinned,
      date: new Date().toISOString().split('T')[0],
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNotePinned(false);
    setShowAddNoteModal(false);
    setToastMessage('Catatan finansial berhasil disimpan!');
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Add Wishlist Submission
  const handleCreateWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishTitle.trim()) return;
    const parsedPrice = parseNumberInput(newWishPrice) || 0;
    addWishlistItem({
      title: newWishTitle.trim(),
      estimatedPrice: parsedPrice,
      savedAmount: 0,
      targetDate: newWishDate || undefined,
      priority: newWishPriority,
      status: 'planned',
      note: newWishNote.trim() || undefined,
      pocketId: newWishPocketId || undefined,
    });
    setNewWishTitle('');
    setNewWishPrice('');
    setNewWishDate('');
    setNewWishNote('');
    setNewWishPocketId('');
    setShowAddWishlistModal(false);
    setToastMessage('Target wishlist baru berhasil ditambahkan!');
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Open Debt Detail Popup
  const handleOpenDebtDetail = (debt: DebtItem) => {
    setSelectedDebtDetail(debt);
    const count = debt.installmentCount && debt.installmentCount > 0 ? debt.installmentCount : 12;
    const perInstallment = Math.round(debt.totalAmount / count);
    setDebtPayAmount(formatNumberInput(Math.min(perInstallment, debt.remainingAmount)));
    setDebtPayPocketId(pockets[0]?.id || 'none');
    setDebtPayError(null);
  };

  // Pay Debt Installment
  const handlePayInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtDetail) return;
    const amountNum = parseNumberInput(debtPayAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setDebtPayError(language === 'id' ? 'Nominal cicilan tidak valid' : 'Invalid payment amount');
      return;
    }

    const isManualPay = !debtPayPocketId || debtPayPocketId === 'none';
    let pocketName = language === 'id' ? 'Pembayaran Manual / Tunai' : 'Manual / Cash Payment';

    if (!isManualPay) {
      const pocket = pockets.find((p) => p.id === debtPayPocketId);
      if (!pocket) {
        setDebtPayError(language === 'id' ? 'Pilih kantong sumber saldo' : 'Select source pocket');
        return;
      }
      if (pocket.balance < amountNum) {
        setDebtPayError(
          language === 'id'
            ? `Saldo ${pocket.name} tidak mencukupi (${formatCurrency(pocket.balance)})`
            : `Insufficient funds in ${pocket.name} (${formatCurrency(pocket.balance)})`
        );
        return;
      }
      pocketName = pocket.name;
    }

    const success = payDebtInstallment(selectedDebtDetail.id, amountNum, debtPayPocketId, selectedDebtDetail.title);
    if (success) {
      setToastMessage(
        isManualPay
          ? language === 'id'
            ? `Cicilan ${formatCurrency(amountNum)} berhasil dibayar (Tanpa potong kantong)!`
            : `Payment of ${formatCurrency(amountNum)} recorded (Manual / Cash)!`
          : language === 'id'
          ? `Cicilan ${formatCurrency(amountNum)} berhasil dibayar dari ${pocketName}!`
          : `Payment of ${formatCurrency(amountNum)} recorded from ${pocketName}!`
      );
      setTimeout(() => setToastMessage(null), 2500);
      setSelectedDebtDetail(null);
    } else {
      setDebtPayError(language === 'id' ? 'Gagal memproses pembayaran cicilan' : 'Payment failed');
    }
  };

  // Create New Debt
  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseNumberInput(newDebtTotal);
    if (!newDebtTitle.trim() || isNaN(totalNum) || totalNum <= 0) return;

    const countNum = parseInt(newDebtInstallments) || 12;
    addDebt({
      title: newDebtTitle.trim(),
      lender: newDebtLender.trim() || (language === 'id' ? 'Lainnya' : 'Other'),
      totalAmount: totalNum,
      remainingAmount: totalNum,
      dueDate: newDebtDueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      installmentCount: countNum,
      paidInstallments: 0,
      status: 'active',
    });

    setNewDebtTitle('');
    setNewLender('');
    setNewDebtTotal('');
    setNewDebtDueDate('');
    setShowAddDebtModal(false);
    setToastMessage(language === 'id' ? 'Hutang baru berhasil dicatat!' : 'New debt recorded successfully!');
    setTimeout(() => setToastMessage(null), 2400);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 relative select-none">
      {/* Toast Notification Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 inset-x-0 mx-auto max-w-sm z-50 px-4 py-3 bg-[#111520] dark:bg-[#1E2435] text-white rounded-2xl shadow-2xl flex items-center space-x-3 pointer-events-none"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="text-xs font-semibold tracking-tight text-white leading-tight">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 1. WALLET HUB VIEW (Tampilan Utama Card-Based)            */}
      {/* ========================================================= */}
      <div className="flex flex-col h-full min-h-0 space-y-4">
        {/* Header (Identik dengan Analisis Keuangan) */}
        <div className="flex items-center justify-between flex-shrink-0 pt-1">
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'id' ? 'Dompet & Keuangan' : 'Financial Hub'}
          </h1>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
            aria-label="Settings"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Scrollable Hub Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pb-24 pr-0.5">
          {/* 1. 4 Core Financial Cards (2-Column Grid on Top) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Catat Hutang */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentSubView('debts')}
              className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5 stroke-[2]" />
                </div>
                {activeDebts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                    {activeDebts.length} Aktif
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Catat Hutang' : 'Debts & Loans'}
                </h3>
                <div className="text-xs font-normal text-slate-900 dark:text-white mt-1 truncate">
                  {formatCurrency(totalDebtsRemaining)}
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-white/70 mt-0.5">
                  {language === 'id' ? 'Cicil & Jatuh Tempo' : 'Installments'}
                </p>
              </div>
            </motion.div>

            {/* Card 2: Portofolio Aset */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentSubView('assets')}
              className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                  {assets.length} Item
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Portofolio Aset' : 'Asset Portfolio'}
                </h3>
                <div className="text-xs font-normal text-slate-900 dark:text-white mt-1 truncate">
                  {formatCurrency(totalAssetsValue)}
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-white/70 mt-0.5">
                  {assetGain >= 0 ? `+${assetGainPercent}% Gain` : `${assetGainPercent}% Loss`}
                </p>
              </div>
            </motion.div>

            {/* Card 3: Budgeting Bulanan */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentSubView('budgets')}
              className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Target className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                  {budgetPercent}%
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Budget Bulanan' : 'Monthly Budget'}
                </h3>
                <div className="text-xs font-normal text-slate-900 dark:text-white mt-1 truncate">
                  {formatCurrency(currentMonthSpent)}
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-white/70 mt-0.5">
                  {language === 'id' ? `Limit: ${formatCurrency(totalBudgetLimit)}` : `Cap: ${formatCurrency(totalBudgetLimit)}`}
                </p>
              </div>
            </motion.div>

            {/* Card 4: Rekening & Kartu Bank (Fitur Salin Cepat) */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentSubView('bank_accounts')}
              className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                  {cards.length} Bank
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Rekening Bank' : 'Bank Accounts'}
                </h3>
                <div className="text-xs font-normal text-slate-900 dark:text-white mt-1 flex items-center space-x-1">
                  <span>1-Klik Salin</span>
                  <Copy className="w-3 h-3 text-slate-400 dark:text-white/70" />
                </div>
                <p className="text-[10px] font-normal text-slate-500 dark:text-white/70 mt-0.5 truncate">
                  {cards[0]?.bankName || 'Mandiri / BCA'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 2. Total Kekayaan Card (Matte Fintech Card - Borderless) */}
          <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-[#141824] p-5 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase tracking-wider">
                  {language === 'id' ? 'Total Kekayaan' : 'Total Net Worth'}
                </span>
              </div>

              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(netWorth)}
              </div>

              {/* Sub-metrics: Saldo Kantong + Aset vs Hutang (Semua Warna Putih / Monokrom) */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-white/60">
                    {language === 'id' ? 'Kantong' : 'Pockets'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {formatCurrency(totalPocketsBalance)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-white/60">
                    {language === 'id' ? 'Aset' : 'Assets'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {formatCurrency(totalAssetsValue)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-white/60">
                    {language === 'id' ? 'Hutang' : 'Debts'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {formatCurrency(totalDebtsRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Featured Card: Kelola Kantong (Full Width - Borderless, Soft Tinted Icon) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentSubView('pockets')}
            className="p-4 rounded-[22px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-[16px] bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <WalletCards className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Kelola Kantong' : 'Manage Pockets'}
                </h3>
                <p className="text-xs font-normal text-slate-500 dark:text-white/70 mt-0.5">
                  {pockets.length} {language === 'id' ? 'Kantong terdaftar' : 'Pockets active'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-white/50 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>

          {/* 4. Featured Goal Card: List Keinginan (Full Width - Attractive Goal Tracker) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentSubView('wishlist')}
            className="p-4 rounded-[22px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer relative overflow-hidden group space-y-3"
          >
            {/* Header: Icon, Title & Dynamic Achievement Subtitle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-[14px] bg-fuchsia-50 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">
                    {language === 'id' ? 'List Keinginan' : 'Wishlist'}
                  </h3>
                  <p className="text-xs font-normal text-slate-500 dark:text-white/70 mt-0.5">
                    {language === 'id'
                      ? `${wishlists.filter((w) => w.status === 'purchased').length} Tercapai, ${wishlists.filter((w) => w.status !== 'purchased').length} On Progress`
                      : `${wishlists.filter((w) => w.status === 'purchased').length} Achieved, ${wishlists.filter((w) => w.status !== 'purchased').length} On Progress`}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center space-x-1.5 flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/50 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Featured Target Highlight & Progress Meter */}
            {topWishlist && (
              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/[0.04] space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {topWishlist.title}
                </div>

                {/* Progress Bar (Solid, Thinner, White) */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-500"
                    style={{ width: `${topWishProgress}%` }}
                  />
                </div>

                {/* Progress Details */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-white/70 font-medium pt-0.5">
                  <span>
                    {formatCurrency(topWishSaved)} {language === 'id' ? 'terkumpul' : 'saved'} ({topWishProgress}%)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(topWishlist.estimatedPrice)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* 5. Catatan Keuangan (Full-Width Memo Strip) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentSubView('notes')}
            className="p-4 rounded-[22px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5 overflow-hidden pr-2">
              <div className="w-10 h-10 rounded-[14px] bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="truncate">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                  {language === 'id' ? 'Catatan Keuangan' : 'Financial Notes'}
                </h3>
                <p className="text-xs font-normal text-slate-500 dark:text-white/70 mt-0.5">
                  {notes.length} {language === 'id' ? 'Memo' : 'Notes'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/50 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-VIEW SLIDE-UP ANIMATED SHEETS                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {currentSubView !== 'hub' && (
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.4 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 top-0 max-w-md mx-auto z-40 bg-[#F1F5F9] dark:bg-[#0A0D15] flex flex-col overflow-hidden px-5 pt-4 pb-20 sm:pb-24 shadow-2xl"
          >
            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 1: KELOLA KANTONG                          */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'pockets' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header Sub-view */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Kelola Kantong' : 'Pocket Management'}
                  </h1>

                  <button
                    onClick={() => setActiveModal('addPocket')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title={language === 'id' ? 'Buat Kantong' : 'Create Pocket'}
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* Action Banner (Borderless & Light Mode Friendly) */}
                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase">
                        {language === 'id' ? 'Total Saldo Kantong' : 'Total Pocket Funds'}
                      </span>
                      <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                        {formatCurrency(totalPocketsBalance)}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveModal('movePocketFunds')}
                      className="px-3 py-2 rounded-[14px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{language === 'id' ? 'Pindah Dana' : 'Transfer'}</span>
                    </button>
                  </div>

                  {/* Pockets List (Borderless) */}
                  <div className="space-y-3">
                    {pockets.map((pkt) => {
                      const percent = pkt.targetAmount > 0 ? Math.min(100, Math.round((pkt.balance / pkt.targetAmount) * 100)) : 100;
                      return (
                        <div
                          key={pkt.id}
                          onClick={() => {
                            setSelectedPocket(pkt);
                            setActiveModal('pocketDetail');
                          }}
                          className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white"
                                style={{ backgroundColor: pkt.color || '#635BFF' }}
                              >
                                <WalletCards className="w-5 h-5 stroke-[2]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {pkt.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 dark:text-[#7B88A6] mt-0.5">
                                  {language === 'id' ? 'Target: ' : 'Goal: '}
                                  {pkt.targetAmount > 0 ? formatCurrency(pkt.targetAmount) : '-'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {formatCurrency(pkt.balance)}
                              </div>
                              {pkt.targetAmount > 0 && (
                                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  {percent}% tercapai
                                </div>
                              )}
                            </div>
                          </div>

                          {pkt.targetAmount > 0 && (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: pkt.color || '#635BFF',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 2: REKENING & KARTU BANK (1-KLIK SALIN)    */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'bank_accounts' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Nomor Rekening & Bank' : 'Bank Accounts'}
                  </h1>

                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setNewCardBank('Bank Mandiri');
                      setNewCardNumber('');
                      setNewCardHolder(user?.name || 'Smith Doe');
                      setShowAddCardModal(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title={language === 'id' ? 'Tambah Rekening' : 'Add Bank Account'}
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* List of Bank Cards */}
                  <div className="space-y-3">
                    {cards.map((card) => {
                      const bankName = card.bankName || 'Bank Mandiri';
                      const accNumber = card.accountNumber || card.cardNumberMask.replace(/[^\d]/g, '') || '1370019283741';
                      const isCopied = copiedAccount === accNumber;

                      return (
                        <motion.div
                          key={card.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setEditingCard(card);
                            setNewCardBank(card.bankName || 'Bank Mandiri');
                            setNewCardNumber(card.accountNumber || card.cardNumberMask.replace(/[^\d]/g, '') || '');
                            setNewCardHolder(card.accountHolder || card.cardHolder || user?.name || '');
                            setShowAddCardModal(true);
                          }}
                          className="relative overflow-hidden rounded-[22px] bg-[#141824] p-5 text-white shadow-md cursor-pointer transition-all group"
                        >
                          {/* Top Row: Bank Name & Copy Pill */}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
                                <Landmark className="w-4 h-4 stroke-[2]" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                  {bankName}
                                </h3>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleCopyAccountNumber(bankName, accNumber, card.accountHolder, e)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>{language === 'id' ? 'Tersalin' : 'Copied'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{language === 'id' ? 'Salin' : 'Copy'}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Center: Large Account Number */}
                          <div className="mt-5 mb-4 relative z-10">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              {language === 'id' ? 'Nomor Rekening' : 'Account Number'}
                            </div>
                            <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-white mt-1">
                              {accNumber}
                            </div>
                          </div>

                          {/* Bottom: Account Holder & Delete Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                                {language === 'id' ? 'Atas Nama (Pemilik)' : 'Account Holder'}
                              </div>
                              <div className="text-xs font-semibold text-slate-200 mt-0.5">
                                {card.accountHolder || card.cardHolder || user?.name}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCard(card.id);
                                setToastMessage(
                                  language === 'id'
                                    ? `Rekening ${bankName} berhasil dihapus`
                                    : `Account ${bankName} deleted`
                                );
                                setTimeout(() => setToastMessage(null), 2400);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                              title={language === 'id' ? 'Hapus Rekening' : 'Delete Account'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 3: PENCATATAN HUTANG                        */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'debts' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Pencatatan Hutang' : 'Debts & Loans'}
                  </h1>

                  <button
                    onClick={() => setShowAddDebtModal(true)}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title={language === 'id' ? 'Tambah Hutang' : 'Add Debt'}
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* Summary Card (Borderless & Light Mode Friendly) */}
                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase">
                        {language === 'id' ? 'Total Sisa Hutang' : 'Total Remaining Debt'}
                      </span>
                      <span className="text-xs font-bold text-rose-500 dark:text-rose-400">
                        {activeDebts.length} {language === 'id' ? 'Pinjaman Aktif' : 'Active'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-rose-500 mt-1">
                      {formatCurrency(totalDebtsRemaining)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {language === 'id' ? 'Sudah Dilunasi' : 'Paid Off'}:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalDebtsPaid)}</span>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#111520] p-1 rounded-[14px]">
                    <button
                      type="button"
                      onClick={() => setDebtFilter('all')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        debtFilter === 'all'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Semua' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtFilter('active')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        debtFilter === 'active'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Aktif' : 'Active'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtFilter('paid_off')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        debtFilter === 'paid_off'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Lunas' : 'Paid'}
                    </button>
                  </div>

                  {/* Debts List (Borderless) */}
                  <div className="space-y-3">
                    {debts
                      .filter((d) => (debtFilter === 'all' ? true : d.status === debtFilter))
                      .map((debt) => (
                        <div
                          key={debt.id}
                          onClick={() => handleOpenDebtDetail(debt)}
                          className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {debt.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-[#7B88A6] mt-0.5">
                                {debt.lender}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                debt.status === 'paid_off'
                                  ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400'
                              }`}
                            >
                              {debt.status === 'paid_off' ? 'LUNAS' : 'AKTIF'}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Sisa Hutang</span>
                              <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                                {formatCurrency(debt.remainingAmount)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Jatuh Tempo</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {debt.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 4: PORTOFOLIO ASET                         */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'assets' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Portofolio Aset' : 'Asset Portfolio'}
                  </h1>

                  <button
                    onClick={() => {
                      setEditingAsset(null);
                      setNewAssetName('');
                      setNewAssetCategory('investment');
                      setNewAssetPurchasePrice('');
                      setNewAssetCurrentValue('');
                      setNewAssetNotes('');
                      setShowAddAssetModal(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title={language === 'id' ? 'Tambah Aset' : 'Add Asset'}
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* Summary Card (Borderless & Light Mode Friendly) */}
                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase">
                        {language === 'id' ? 'Total Nilai Pasar Aset' : 'Total Asset Market Value'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-white">
                        {assets.length} Aset
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {formatCurrency(totalAssetsValue)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {language === 'id' ? 'Keuntungan / Gain' : 'Capital Gain'}:
                      </span>
                      <span className={`font-bold ${assetGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {assetGain >= 0 ? `+${formatCurrency(assetGain)} (+${assetGainPercent}%)` : `${formatCurrency(assetGain)} (${assetGainPercent}%)`}
                      </span>
                    </div>
                  </div>

                  {/* Asset List (Borderless) */}
                  <div className="space-y-3">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setEditingAsset(asset);
                          setNewAssetName(asset.name);
                          setNewAssetCategory(asset.category);
                          setNewAssetPurchasePrice(formatNumberInput(asset.purchasePrice));
                          setNewAssetCurrentValue(formatNumberInput(asset.currentValue));
                          setNewAssetNotes(asset.notes || '');
                          setShowAddAssetModal(true);
                        }}
                        className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {asset.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-[#7B88A6] mt-0.5 capitalize truncate">
                            {asset.notes || asset.category}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {formatCurrency(asset.currentValue)}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Beli: {formatCurrency(asset.purchasePrice)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAsset(asset.id);
                              setToastMessage(
                                language === 'id'
                                  ? `Aset "${asset.name}" berhasil dihapus!`
                                  : `Asset "${asset.name}" deleted!`
                              );
                              setTimeout(() => setToastMessage(null), 2400);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title={language === 'id' ? 'Hapus Aset' : 'Delete Asset'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 5: BUDGETING BULANAN                       */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'budgets' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Budgeting Bulanan' : 'Monthly Budgets'}
                  </h1>

                  <button
                    onClick={() => {
                      setEditingBudget(null);
                      setNewBudgetCategory('food');
                      setNewBudgetLimit('');
                      setShowAddBudgetModal(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title={language === 'id' ? 'Tambah Budget' : 'Add Budget'}
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* Summary Card (Borderless & Light Mode Friendly) */}
                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase">
                        {language === 'id' ? 'Pemakaian Budget Bulan Ini' : 'Monthly Budget Usage'}
                      </span>
                      <span className={`text-xs font-bold ${budgetPercent > 90 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {budgetPercent}% Terpakai
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {formatCurrency(currentMonthSpent)}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Total Limit: {formatCurrency(totalBudgetLimit)}</span>
                      <span>Sisa: {formatCurrency(Math.max(0, totalBudgetLimit - currentMonthSpent))}</span>
                    </div>
                  </div>

                  {/* Category Budgets (Borderless) */}
                  <div className="space-y-3">
                    {budgets.map((b) => {
                      const spent = transactions
                        .filter((tx) => tx.type === 'expense' && tx.category === b.category && tx.date.startsWith(currentMonthStr))
                        .reduce((sum, tx) => sum + tx.amount, 0);
                      const catPercent = b.monthlyLimit > 0 ? Math.min(100, Math.round((spent / b.monthlyLimit) * 100)) : 0;

                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setEditingBudget(b);
                            setNewBudgetCategory(b.category);
                            setNewBudgetLimit(formatNumberInput(b.monthlyLimit));
                            setShowAddBudgetModal(true);
                          }}
                          className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                              {b.category}
                            </span>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategoryBudget(b.category);
                                  setToastMessage(
                                    language === 'id'
                                      ? `Budget "${b.category}" berhasil dihapus!`
                                      : `Budget "${b.category}" deleted!`
                                  );
                                  setTimeout(() => setToastMessage(null), 2400);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                title={language === 'id' ? 'Hapus Budget' : 'Delete Budget'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                catPercent >= 100 ? 'bg-rose-500' : catPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${catPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 6: CATATAN KEUANGAN (FITUR BARU)           */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'notes' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Catatan Keuangan' : 'Financial Notes'}
                  </h1>

                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Tambah Catatan"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3 pr-0.5">
                  {notes.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs">Belum ada catatan finansial tersimpan.</p>
                    </div>
                  ) : (
                    notes
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm hover:shadow transition-all relative group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {note.isPinned && (
                                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                {note.tag || 'Catatan'}
                              </span>
                              <span className="text-[10px] text-slate-400">{note.date}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                                className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                                title={note.isPinned ? 'Lepas Semat' : 'Sematkan'}
                              >
                                {note.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNote(note.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Hapus Catatan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                            {note.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-VIEW 7: DAFTAR KEINGINAN / WISHLIST (FITUR BARU) */}
            {/* ---------------------------------------------------- */}
            {currentSubView === 'wishlist' && (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setCurrentSubView('hub')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Daftar Keinginan' : 'Wishlist'}
                  </h1>

                  <button
                    onClick={() => setShowAddWishlistModal(true)}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Tambah Wishlist"
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-3.5 pr-0.5">
                  {/* Summary Card (Borderless & Light Mode Friendly) */}
                  <div className="p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8C98B3] uppercase">
                        {language === 'id' ? 'Estimasi Total Dana Wishlist' : 'Total Planned Target'}
                      </span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-white/80">
                        {totalWishlistPlanned.length} {language === 'id' ? 'Item Impian' : 'Items'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {formatCurrency(totalWishlistNeeded)}
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#111520] p-1 rounded-[14px]">
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('all')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        wishlistFilter === 'all'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Semua' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('planned')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        wishlistFilter === 'planned'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Rencana' : 'Planned'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('purchased')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-[10px] transition-colors ${
                        wishlistFilter === 'purchased'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-[#7B88A6]'
                      }`}
                    >
                      {language === 'id' ? 'Tercapai' : 'Achieved'}
                    </button>
                  </div>

                  {/* Wishlist Items List (Borderless) */}
                  <div className="space-y-3">
                    {wishlists
                      .filter((w) => (wishlistFilter === 'all' ? true : w.status === wishlistFilter))
                      .map((wish) => {
                        const linkedPocket = pockets.find((p) => p.id === wish.pocketId);
                        const isAchieved = wish.status === 'purchased';

                        return (
                          <div
                            key={wish.id}
                            className={`p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm transition-all ${
                              isAchieved
                                ? 'opacity-80'
                                : 'hover:shadow'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="pr-2">
                                <h4
                                  className={`text-sm font-bold ${
                                    isAchieved ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {wish.title}
                                </h4>
                                {wish.targetDate && (
                                  <p className="text-[10px] font-normal text-slate-400 dark:text-white/60 mt-0.5">
                                    Target: {wish.targetDate}
                                  </p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-semibold text-slate-700 dark:text-white/80">
                                  {formatCurrency(wish.estimatedPrice)}
                                </div>
                              </div>
                            </div>

                            {wish.note && (
                              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-white/60 mt-1">
                                {wish.note}
                              </p>
                            )}

                            {/* Linked pocket badge if any */}
                            {linkedPocket && (
                              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center space-x-1">
                                  <WalletCards className="w-3.5 h-3.5" />
                                  <span>{linkedPocket.name}</span>
                                </span>
                                <span className="font-semibold text-emerald-500">
                                  Saldo: {formatCurrency(linkedPocket.balance)}
                                </span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus = isAchieved ? 'planned' : 'purchased';
                                  updateWishlistItem(wish.id, {
                                    status: nextStatus,
                                  });
                                  setToastMessage(
                                    language === 'id'
                                      ? (nextStatus === 'purchased'
                                          ? `"${wish.title}" berhasil ditandai sudah dibeli! 🎉`
                                          : `Status "${wish.title}" dikembalikan ke rencana.`)
                                      : (nextStatus === 'purchased'
                                          ? `"${wish.title}" marked as purchased! 🎉`
                                          : `"${wish.title}" reverted to planned.`)
                                  );
                                  setTimeout(() => setToastMessage(null), 2400);
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer ${
                                  isAchieved
                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isAchieved ? (language === 'id' ? 'Batalkan Tercapai' : 'Mark as Planned') : (language === 'id' ? 'Tandai Sudah Dibeli' : 'Mark as Purchased')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWishlistItem(wish.id);
                                  setToastMessage(
                                    language === 'id'
                                      ? `Barang impian "${wish.title}" berhasil dihapus!`
                                      : `Wishlist item "${wish.title}" deleted!`
                                  );
                                  setTimeout(() => setToastMessage(null), 2400);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                title={language === 'id' ? 'Hapus Wishlist' : 'Delete Wishlist'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. MODALS UNTUK SUB-VIEWS (TAMBAH DATA)                   */}
      {/* ========================================================= */}

      {/* Modal: Tambah & Edit Rekening Bank */}
      <AnimatePresence>
        {showAddCardModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddCardModal(false);
                setEditingCard(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {editingCard
                  ? language === 'id' ? 'Edit Rekening Bank' : 'Edit Bank Account'
                  : language === 'id' ? 'Tambah Rekening Bank' : 'Add Bank Account'}
              </h3>
              <form onSubmit={handleSaveCard} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nama Bank / Provider
                  </label>
                  <select
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="BCA (Bank Central Asia)">BCA (Bank Central Asia)</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="Bank Jago">Bank Jago</option>
                    <option value="Bank BSI (Syariah)">Bank BSI (Syariah)</option>
                    <option value="GoPay / OVO / Dana">E-Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1370019283741"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Atas Nama Pemilik
                  </label>
                  <input
                    type="text"
                    required
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCardModal(false);
                      setEditingCard(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    {editingCard
                      ? language === 'id' ? 'Simpan Perubahan' : 'Save Changes'
                      : language === 'id' ? 'Simpan Rekening' : 'Save Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah & Edit Portofolio Aset */}
      <AnimatePresence>
        {showAddAssetModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddAssetModal(false);
                setEditingAsset(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {editingAsset
                  ? language === 'id' ? 'Edit Data Aset' : 'Edit Asset'
                  : language === 'id' ? 'Tambah Aset Baru' : 'Add New Asset'}
              </h3>
              <form onSubmit={handleSaveAsset} className="space-y-3.5">
                {newAssetError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-xs font-medium text-center">
                    {newAssetError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'id' ? 'Nama Aset' : 'Asset Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Logam Mulia Antam 25gr"
                    value={newAssetName}
                    onChange={(e) => {
                      setNewAssetName(e.target.value);
                      setNewAssetError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'id' ? 'Kategori Aset' : 'Asset Category'}
                  </label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as AssetItem['category'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="investment">Investasi / Saham / Reksadana</option>
                    <option value="precious_metal">Emas & Logam Mulia</option>
                    <option value="property">Properti / Rumah / Tanah</option>
                    <option value="vehicle">Kendaraan (Mobil / Motor)</option>
                    <option value="electronics">Elektronik / Gadget</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      {language === 'id' ? 'Harga Beli (Rp)' : 'Purchase Price'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Contoh: 25.000.000"
                      value={newAssetPurchasePrice}
                      onChange={(e) => {
                        setNewAssetPurchasePrice(formatNumberInput(e.target.value));
                        setNewAssetError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      {language === 'id' ? 'Nilai Sekarang (Rp)' : 'Current Value'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Contoh: 30.000.000"
                      value={newAssetCurrentValue}
                      onChange={(e) => {
                        setNewAssetCurrentValue(formatNumberInput(e.target.value));
                        setNewAssetError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* Sumber Dana (Ambil Saldo Dari Kantong) - hanya untuk aset baru */}
                {!editingAsset && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                        {language === 'id' ? 'Ambil Saldo Dari Kantong' : 'Deduct from Pocket'}
                      </label>
                      {newAssetPocketId && newAssetPocketId !== 'none' && (
                        <span className="text-[10px] font-semibold text-[#635BFF]">
                          {(() => {
                            const p = pockets.find((pkt) => pkt.id === newAssetPocketId);
                            return p ? `Saldo: ${formatCurrency(p.balance)}` : '';
                          })()}
                        </span>
                      )}
                    </div>
                    <select
                      value={newAssetPocketId}
                      onChange={(e) => {
                        setNewAssetPocketId(e.target.value);
                        setNewAssetError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="none">
                        {language === 'id'
                          ? 'Jangan potong dari kantong manapun'
                          : 'Do not deduct from any pocket'}
                      </option>
                      {pockets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Saldo: {formatCurrency(p.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'id' ? 'Keterangan / Lokasi Simpan' : 'Notes / Location'}
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Safe deposit box / BBCA & Obligasi"
                    value={newAssetNotes}
                    onChange={(e) => setNewAssetNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAssetModal(false);
                      setEditingAsset(null);
                      setNewAssetPocketId('none');
                      setNewAssetError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    {editingAsset
                      ? language === 'id' ? 'Simpan Perubahan' : 'Save Changes'
                      : language === 'id' ? 'Simpan Aset' : 'Save Asset'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah & Edit Budget Bulanan */}
      <AnimatePresence>
        {showAddBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddBudgetModal(false);
                setEditingBudget(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {editingBudget
                  ? language === 'id' ? 'Edit Budget Bulanan' : 'Edit Monthly Budget'
                  : language === 'id' ? 'Tambah Budget Bulanan' : 'Add Monthly Budget'}
              </h3>
              <form onSubmit={handleSaveBudget} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'id' ? 'Kategori Pengeluaran' : 'Category'}
                  </label>
                  <select
                    value={newBudgetCategory}
                    onChange={(e) => setNewBudgetCategory(e.target.value as Transaction['category'])}
                    disabled={!!editingBudget}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none capitalize disabled:opacity-70"
                  >
                    <option value="food">Food & Makanan</option>
                    <option value="transport">Transportasi</option>
                    <option value="shopping">Shopping & Belanja</option>
                    <option value="bills">Bills & Tagihan</option>
                    <option value="entertainment">Entertainment & Hiburan</option>
                    <option value="health">Kesehatan</option>
                    <option value="education">Pendidikan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'id' ? 'Batas Limit Bulanan (Rp)' : 'Monthly Limit (Rp)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Contoh: 1.500.000"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(formatNumberInput(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBudgetModal(false);
                      setEditingBudget(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    {editingBudget
                      ? language === 'id' ? 'Simpan Perubahan' : 'Save Changes'
                      : language === 'id' ? 'Simpan Budget' : 'Save Budget'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah Catatan Finansial */}
      <AnimatePresence>
        {showAddNoteModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddNoteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {language === 'id' ? 'Buat Catatan Finansial Baru' : 'Add Financial Note'}
              </h3>
              <form onSubmit={handleCreateNote} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Judul Catatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rencana Alokasi Dividen"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Tag / Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Pajak / Investasi / Rencana / Asuransi"
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Isi Catatan
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tulis detail catatan finansial atau nomor polis penting..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pinCheck"
                    checked={newNotePinned}
                    onChange={(e) => setNewNotePinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#635BFF] focus:ring-0"
                  />
                  <label htmlFor="pinCheck" className="text-xs text-slate-700 dark:text-slate-300">
                    Sematkan catatan ini di paling atas
                  </label>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNoteModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah Wishlist Barang */}
      <AnimatePresence>
        {showAddWishlistModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddWishlistModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {language === 'id' ? 'Tambah Barang Impian (Wishlist)' : 'Add Wishlist Target'}
              </h3>
              <form onSubmit={handleCreateWishlist} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nama Barang Impian
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MacBook Air M3"
                    value={newWishTitle}
                    onChange={(e) => setNewWishTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Estimasi Harga (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Contoh: 15.000.000"
                      value={newWishPrice}
                      onChange={(e) => setNewWishPrice(formatNumberInput(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Prioritas
                    </label>
                    <select
                      value={newWishPriority}
                      onChange={(e) => setNewWishPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Target Pembelian
                    </label>
                    <input
                      type="date"
                      value={newWishDate}
                      onChange={(e) => setNewWishDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Kaitkan ke Kantong
                    </label>
                    <select
                      value={newWishPocketId}
                      onChange={(e) => setNewWishPocketId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="">Tanpa Kantong</option>
                      {pockets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Catatan Tambahan / Link Toko
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Warna Space Grey 512GB"
                    value={newWishNote}
                    onChange={(e) => setNewWishNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddWishlistModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Simpan Wishlist
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Rincian Hutang & Form Bayar Cicilan */}
      <AnimatePresence>
        {selectedDebtDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDebtDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedDebtDetail.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedDebtDetail.lender}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDebtDetail(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/80 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress & Detail Content */}
              {(() => {
                const total = selectedDebtDetail.totalAmount;
                const remaining = selectedDebtDetail.remainingAmount;
                const paid = Math.max(0, total - remaining);
                const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;
                const totalCount = selectedDebtDetail.installmentCount || 12;
                const paidCount = selectedDebtDetail.paidInstallments || 0;
                const isPaidOff = selectedDebtDetail.status === 'paid_off' || remaining <= 0;

                return (
                  <div className="space-y-4 my-4">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Status Pinjaman
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaidOff
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPaidOff ? 'LUNAS' : 'AKTIF'}
                      </span>
                    </div>

                    {/* Financial Summary 3-Box Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block font-normal">Total Pinjaman</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block font-normal">Sudah Dicicil</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                          {formatCurrency(paid)}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block font-normal">Sisa Hutang</span>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5 block truncate">
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Meter */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-white/90">
                          {paidCount} dari {totalCount}x Cicilan
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPaidOff ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-white'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Jatuh Tempo: {selectedDebtDetail.dueDate}</span>
                        <span>{formatCurrency(remaining)} tersisa</span>
                      </div>
                    </div>

                    {/* Bayar Cicilan Form */}
                    {!isPaidOff ? (
                      <form onSubmit={handlePayInstallment} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Bayar / Cicil Hutang
                        </h4>

                        {/* Sumber Dana (Kantong) */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Ambil Saldo Dari Kantong
                          </label>
                          <select
                            value={debtPayPocketId}
                            onChange={(e) => setDebtPayPocketId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                          >
                            <option value="none">
                              {language === 'id'
                                ? '🚫 Jangan potong dari kantong manapun (Bayar Manual / Tunai)'
                                : '🚫 Do not deduct from any pocket (Manual / Cash)'}
                            </option>
                            {pockets.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — Saldo: {formatCurrency(p.balance)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Nominal Cicilan */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              Nominal Pembayaran (Rp)
                            </label>
                            <div className="flex items-center space-x-1.5 text-[10px]">
                              <button
                                type="button"
                                onClick={() => {
                                  const perInst = Math.round(total / totalCount);
                                  setDebtPayAmount(formatNumberInput(Math.min(perInst, remaining)));
                                }}
                                className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                              >
                                1x Cicilan
                              </button>
                              <button
                                type="button"
                                onClick={() => setDebtPayAmount(formatNumberInput(remaining))}
                                className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                              >
                                Lunasi Sisa
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={debtPayAmount}
                            onChange={(e) => setDebtPayAmount(formatNumberInput(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                            placeholder="Nominal bayar..."
                          />
                        </div>

                        {debtPayError && (
                          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                            {debtPayError}
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDebtDetail(null)}
                            className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            Bayar Cicilan
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hutang ini sudah lunas sepenuhnya!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDebtDetail(null)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah Catatan Hutang Baru */}
      <AnimatePresence>
        {showAddDebtModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDebtModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {language === 'id' ? 'Tambah Catatan Hutang Baru' : 'Add New Debt'}
              </h3>
              <form onSubmit={handleCreateDebt} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nama Pinjaman / Keperluan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cicilan Laptop Kerja"
                    value={newDebtTitle}
                    onChange={(e) => setNewDebtTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Pemberi Pinjaman / Platform
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Mandiri / PayLater"
                    value={newDebtLender}
                    onChange={(e) => setNewLender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Total Hutang (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Contoh: 12.000.000"
                      value={newDebtTotal}
                      onChange={(e) => setNewDebtTotal(formatNumberInput(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Tenor (Jumlah Cicilan)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="12"
                      value={newDebtInstallments}
                      onChange={(e) => setNewDebtInstallments(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    required
                    value={newDebtDueDate}
                    onChange={(e) => setNewDebtDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDebtModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Simpan Hutang
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
