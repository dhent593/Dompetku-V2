'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
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
  ChevronDown,
  Building2,
  Car,
  Laptop,
  Package,
  Coins,
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
import { NoteItem, WishlistItem, PaymentCard, AssetItem, DebtItem, CategoryBudget, Transaction, Pocket } from '@/types';

type SubViewType = 'hub' | 'pockets' | 'debts' | 'assets' | 'budgets' | 'bank_accounts' | 'notes' | 'wishlist';

export const ASSET_CATEGORIES = [
  {
    id: 'precious_metal' as const,
    labelId: 'Emas & Logam Mulia',
    labelEn: 'Precious Metals & Gold',
    icon: Coins,
    colorClasses: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    },
  },
  {
    id: 'investment' as const,
    labelId: 'Investasi / Saham / Reksadana',
    labelEn: 'Investments & Stocks',
    icon: TrendingUp,
    colorClasses: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    },
  },
  {
    id: 'property' as const,
    labelId: 'Properti / Rumah / Tanah',
    labelEn: 'Property & Real Estate',
    icon: Building2,
    colorClasses: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-600 dark:text-indigo-400',
      badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
    },
  },
  {
    id: 'vehicle' as const,
    labelId: 'Kendaraan (Mobil / Motor)',
    labelEn: 'Vehicles',
    icon: Car,
    colorClasses: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
    },
  },
  {
    id: 'electronics' as const,
    labelId: 'Elektronik / Gadget',
    labelEn: 'Electronics & Gadgets',
    icon: Laptop,
    colorClasses: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
    },
  },
  {
    id: 'other' as const,
    labelId: 'Lainnya',
    labelEn: 'Other Assets',
    icon: Package,
    colorClasses: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800/60',
    },
  },
];

interface WalletPocketItemProps {
  pkt: Pocket;
  language: string;
  formatCurrency: (val: number) => string;
  onSelect: () => void;
  isReorderMode: boolean;
  onStartReorder: () => void;
}

const ReorderableWalletPocketItem: React.FC<WalletPocketItemProps> = ({
  pkt,
  language,
  formatCurrency,
  onSelect,
  isReorderMode,
  onStartReorder,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = useRef(false);

  const percent = pkt.targetAmount > 0 ? Math.min(100, Math.round((pkt.balance / pkt.targetAmount) * 100)) : 100;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isReorderMode) return;
    isLongPressRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    clearTimer();

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch (_) {}
      }
      onStartReorder();
    }, 350);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isReorderMode || !startPosRef.current || isLongPressRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearTimer();
    }
  };

  const handlePointerUp = () => {
    clearTimer();
    startPosRef.current = null;
    if (!isReorderMode && !isLongPressRef.current) {
      onSelect();
    }
  };

  const handlePointerCancel = () => {
    clearTimer();
    startPosRef.current = null;
  };

  return (
    <Reorder.Item
      value={pkt}
      dragListener={isReorderMode}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(25);
          } catch (_) {}
        }
      }}
      animate={
        isDragging
          ? { scale: 1.04, rotate: 0, zIndex: 50 }
          : isReorderMode
            ? {
                rotate: [-0.9, 0.9, -0.9],
                transition: {
                  repeat: Infinity,
                  duration: 0.22,
                  ease: 'easeInOut',
                },
              }
            : { scale: 1, rotate: 0, zIndex: 1 }
      }
      whileDrag={{
        scale: 1.04,
        rotate: 0,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        zIndex: 50,
      }}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`p-4 rounded-[20px] bg-white dark:bg-[#141824] transition-shadow select-none relative ${
        isReorderMode ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-pointer'
      } ${
        isDragging
          ? 'ring-2 ring-[#635BFF] shadow-2xl z-50'
          : isReorderMode
            ? 'ring-2 ring-[#635BFF]/50 shadow-md'
            : 'shadow-sm hover:shadow'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white flex-shrink-0"
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
    </Reorder.Item>
  );
};

export const WalletView: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const {
    pockets,
    setSelectedPocket,
    updatePocket,
    reorderPockets,
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
  const [isPocketReorderMode, setIsPocketReorderMode] = useState(false);

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
  const [addAssetSourceType, setAddAssetSourceType] = useState<'new' | 'from_pocket'>('new');
  const [selectedPocketForAsset, setSelectedPocketForAsset] = useState<string>('');
  const [selectPocketDropdownOpen, setSelectPocketDropdownOpen] = useState(false);
  const [assetCategoryDropdownOpen, setAssetCategoryDropdownOpen] = useState(false);
  const [assetPocketDropdownOpen, setAssetPocketDropdownOpen] = useState(false);
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
      if (assetCategoryDropdownOpen) {
        setAssetCategoryDropdownOpen(false);
        return true;
      }
      if (assetPocketDropdownOpen || selectPocketDropdownOpen) {
        setAssetPocketDropdownOpen(false);
        setSelectPocketDropdownOpen(false);
        return true;
      }
      if (showAddAssetModal || editingAsset) {
        setShowAddAssetModal(false);
        setEditingAsset(null);
        setAssetCategoryDropdownOpen(false);
        setAssetPocketDropdownOpen(false);
        setSelectPocketDropdownOpen(false);
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
    assetCategoryDropdownOpen,
    assetPocketDropdownOpen,
  ]);

  // Accordion state for Portofolio Aset
  const [expandedAssetCategories, setExpandedAssetCategories] = useState<Record<string, boolean>>({
    precious_metal: true,
    investment: true,
    property: true,
    vehicle: true,
    electronics: true,
    other: true,
  });

  const toggleAssetCategory = (categoryKey: string) => {
    setExpandedAssetCategories((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey] === undefined ? false : !prev[categoryKey],
    }));
  };

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
  const liquidPockets = pockets.filter((p) => !p.isAsset);
  const assetPockets = pockets.filter((p) => p.isAsset);
  const liquidPocketsBalance = liquidPockets.reduce((sum, p) => sum + p.balance, 0);
  const assetPocketsBalance = assetPockets.reduce((sum, p) => sum + p.balance, 0);
  const manualAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const manualAssetsPurchase = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalAssetsValue = manualAssetsValue + assetPocketsBalance;
  const totalAssetsPurchase = manualAssetsPurchase + assetPocketsBalance;
  const assetGain = totalAssetsValue - totalAssetsPurchase;
  const assetGainPercent = totalAssetsPurchase > 0 ? ((assetGain / totalAssetsPurchase) * 100).toFixed(1) : '0';
  const totalAssetItemsCount = assets.length + assetPockets.length;

  const activeDebts = debts.filter((d) => d.status !== 'paid_off');
  const totalDebtsRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalDebtsOriginal = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtsPaid = totalDebtsOriginal - totalDebtsRemaining;

  const netWorth = liquidPocketsBalance + totalAssetsValue - totalDebtsRemaining;

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
      {/* Toast Notification (Modern Floating Capsule) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="fixed top-5 inset-x-0 mx-auto w-max max-w-[90vw] z-50 pointer-events-none select-none flex justify-center"
          >
            <div className="toast-capsule bg-[#0F172A]/95 dark:bg-[#161B26]/95 text-white text-[12.5px] font-semibold pl-3.5 pr-5 py-2.5 rounded-full shadow-[0_12px_32px_rgba(15,23,42,0.28)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/10 dark:border-white/10 flex items-center space-x-2.5 whitespace-nowrap transition-colors">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <p className="text-white tracking-tight leading-none">
                {toastMessage}
              </p>
            </div>
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
          {/* 1. Total Kekayaan Card (Matte Fintech Card - Paling Atas) */}
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
                    {formatCurrency(liquidPocketsBalance)}
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

          {/* 2. 4 Core Financial Cards (2-Column Grid) */}
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
                  {totalAssetItemsCount} Item
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
                    <div className="flex items-center space-x-2">
                      {isPocketReorderMode ? (
                        <button
                          onClick={() => setIsPocketReorderMode(false)}
                          className="px-3 py-2 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{language === 'id' ? 'Selesai' : 'Done'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveModal('movePocketFunds')}
                          className="px-3 py-2 rounded-[14px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>{language === 'id' ? 'Pindah Dana' : 'Transfer'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pockets List (Borderless - Long-press to Reorder) */}
                  <Reorder.Group
                    axis="y"
                    values={pockets}
                    onReorder={reorderPockets}
                    className="space-y-3 -mx-2 px-2 py-1"
                  >
                    {pockets.map((pkt) => (
                      <ReorderableWalletPocketItem
                        key={pkt.id}
                        pkt={pkt}
                        language={language}
                        formatCurrency={formatCurrency}
                        isReorderMode={isPocketReorderMode}
                        onStartReorder={() => setIsPocketReorderMode(true)}
                        onSelect={() => {
                          setSelectedPocket(pkt);
                          setActiveModal('pocketDetail');
                        }}
                      />
                    ))}
                  </Reorder.Group>
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
                          className="relative overflow-hidden rounded-[22px] bg-white dark:bg-[#141824] p-5 text-slate-900 dark:text-white shadow-sm dark:shadow-md border border-slate-100/90 dark:border-slate-800/60 cursor-pointer transition-all group"
                        >
                          {/* Top Row: Bank Name & Copy Pill */}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white/90">
                                <Landmark className="w-4 h-4 stroke-[2]" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
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
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white'
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
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                              {language === 'id' ? 'Nomor Rekening' : 'Account Number'}
                            </div>
                            <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 dark:text-white mt-1">
                              {accNumber}
                            </div>
                          </div>

                          {/* Bottom: Account Holder & Delete Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10 relative z-10">
                            <div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                                {language === 'id' ? 'Atas Nama (Pemilik)' : 'Account Holder'}
                              </div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
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
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
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
                  <div className="tab-container flex items-center space-x-1.5 bg-slate-200/70 dark:bg-[#111520] border border-slate-200/80 dark:border-[#1E2538] p-1.5 rounded-[16px]">
                    <button
                      type="button"
                      onClick={() => setDebtFilter('all')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        debtFilter === 'all'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
                      }`}
                    >
                      {language === 'id' ? 'Semua' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtFilter('active')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        debtFilter === 'active'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
                      }`}
                    >
                      {language === 'id' ? 'Aktif' : 'Active'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtFilter('paid_off')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        debtFilter === 'paid_off'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
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
                      setNewAssetPocketId('none');
                      setNewAssetError(null);
                      setAssetCategoryDropdownOpen(false);
                      setAssetPocketDropdownOpen(false);
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

                  {/* Asset List by Category (Accordion) */}
                  {(() => {
                    const groupedAssets = ASSET_CATEGORIES.map((cat) => {
                      const items = assets.filter((a) => (a.category || 'other') === cat.id);
                      const totalValue = items.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);
                      const totalPurchase = items.reduce((sum, a) => sum + (Number(a.purchasePrice) || 0), 0);
                      const gain = totalValue - totalPurchase;
                      const gainPercent = totalPurchase > 0 ? ((gain / totalPurchase) * 100).toFixed(1) : '0';
                      return {
                        ...cat,
                        items,
                        totalValue,
                        totalPurchase,
                        gain,
                        gainPercent,
                      };
                    }).filter((group) => group.items.length > 0);

                    if (assets.length === 0 && assetPockets.length === 0) {
                      return (
                        <div className="py-12 px-6 rounded-[24px] bg-white dark:bg-[#141824] shadow-sm text-center flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-3">
                            <Coins className="w-7 h-7" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {language === 'id' ? 'Belum Ada Aset' : 'No Assets Yet'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
                            {language === 'id'
                              ? 'Mulai catat portofolio emas, saham, kendaraan, properti, atau jadikan kantong sebagai aset.'
                              : 'Start tracking precious metals, stocks, vehicles, property, or convert pockets to assets.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAsset(null);
                              setAddAssetSourceType('new');
                              setNewAssetName('');
                              setNewAssetCategory('investment');
                              setNewAssetPurchasePrice('');
                              setNewAssetCurrentValue('');
                              setNewAssetNotes('');
                              setNewAssetPocketId('none');
                              setNewAssetError(null);
                              setAssetCategoryDropdownOpen(false);
                              setAssetPocketDropdownOpen(false);
                              setSelectPocketDropdownOpen(false);
                              setShowAddAssetModal(true);
                            }}
                            className="mt-4 px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold shadow-sm hover:bg-[#564EE6] active:scale-95 transition-all cursor-pointer"
                          >
                            + {language === 'id' ? 'Tambah Aset' : 'Add Asset'}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {/* 1. Kantong yang Berstatus Aset */}
                        {assetPockets.length > 0 && (
                          <div className="rounded-[20px] bg-white dark:bg-[#141824] shadow-sm overflow-hidden transition-all duration-200 border border-slate-100/60 dark:border-slate-800/40">
                            {/* Accordion Header */}
                            <button
                              type="button"
                              onClick={() => toggleAssetCategory('pocket_assets')}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-[#181E2E]/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 min-w-0 pr-2">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500 dark:text-amber-400">
                                  <WalletCards className="w-5 h-5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                      {language === 'id' ? 'Aset Kantong & Simpanan' : 'Pocket Assets & Savings'}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                      {assetPockets.length} Kantong
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    {language === 'id' ? 'Total Nilai' : 'Total Value'}:{' '}
                                    <span className="font-extrabold text-slate-900 dark:text-white">
                                      {formatCurrency(assetPocketsBalance)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-200 transform-gpu ${
                                    expandedAssetCategories['pocket_assets'] !== false ? 'rotate-180 text-[#635BFF] dark:text-[#827CFF]' : ''
                                  }`}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </div>
                            </button>

                            {/* Accordion Collapsible Items */}
                            <AnimatePresence initial={false}>
                              {expandedAssetCategories['pocket_assets'] !== false && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.22 }}
                                  className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                                >
                                  <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-[#0F131D]/40">
                                    {assetPockets.map((pkt) => (
                                      <div
                                        key={pkt.id}
                                        onClick={() => setSelectedPocket(pkt)}
                                        className="p-3.5 rounded-[16px] bg-white dark:bg-[#141824] shadow-xs hover:shadow-sm border border-slate-100/90 dark:border-slate-800/60 transition-all cursor-pointer flex items-center justify-between group"
                                      >
                                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                                          <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                                            style={{ backgroundColor: pkt.color }}
                                          >
                                            <WalletCards className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {pkt.name}
                                              </h4>
                                              <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded shadow-xs">
                                                Aset
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                              Target: {formatCurrency(pkt.targetAmount)} • {language === 'id' ? 'Klik untuk kelola' : 'Click to manage'}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            {formatCurrency(pkt.balance)}
                                          </div>
                                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                            {language === 'id' ? 'Saldo Kas Aset' : 'Cash Asset'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* 2. Aset Fisik & Investasi Reguler */}
                        {groupedAssets.map((group) => {
                          const isExpanded = expandedAssetCategories[group.id] !== false;
                          const CatIcon = group.icon;

                          return (
                            <div
                              key={group.id}
                              className="rounded-[20px] bg-white dark:bg-[#141824] shadow-sm overflow-hidden transition-all duration-200 border border-slate-100/60 dark:border-slate-800/40"
                            >
                              {/* Accordion Header */}
                              <button
                                type="button"
                                onClick={() => toggleAssetCategory(group.id)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-[#181E2E]/60 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center space-x-3 min-w-0 pr-2">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${group.colorClasses.bg} ${group.colorClasses.text}`}>
                                    <CatIcon className="w-5 h-5 stroke-[2.2]" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {language === 'id' ? group.labelId : group.labelEn}
                                      </h3>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {group.items.length} Aset
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                      {language === 'id' ? 'Total' : 'Total'}:{' '}
                                      <span className="font-extrabold text-slate-900 dark:text-white">
                                        {formatCurrency(group.totalValue)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-200 transform-gpu ${
                                      isExpanded ? 'rotate-180 text-[#635BFF] dark:text-[#827CFF]' : ''
                                    }`}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </div>
                              </button>

                              {/* Accordion Collapsible Items */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.22 }}
                                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                                  >
                                    <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-[#0F131D]/40">
                                      {group.items.map((asset) => (
                                        <div
                                          key={asset.id}
                                          onClick={() => {
                                            setEditingAsset(asset);
                                            setNewAssetName(asset.name);
                                            setNewAssetCategory(asset.category);
                                            setNewAssetPurchasePrice(formatNumberInput(asset.purchasePrice));
                                            setNewAssetCurrentValue(formatNumberInput(asset.currentValue));
                                            setNewAssetNotes(asset.notes || '');
                                            setNewAssetPocketId(asset.pocketId || 'none');
                                            setNewAssetError(null);
                                            setAssetCategoryDropdownOpen(false);
                                            setAssetPocketDropdownOpen(false);
                                            setShowAddAssetModal(true);
                                          }}
                                          className="p-3.5 rounded-[16px] bg-white dark:bg-[#141824] shadow-xs hover:shadow-sm border border-slate-100/90 dark:border-slate-800/60 transition-all cursor-pointer flex items-center justify-between group"
                                        >
                                          <div className="flex-1 min-w-0 pr-3">
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                              {asset.name}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-[#7B88A6] mt-0.5 capitalize truncate">
                                              {asset.notes || (language === 'id' ? group.labelId : group.labelEn)}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2.5 flex-shrink-0">
                                            <div className="text-right">
                                              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
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
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                  <div className="tab-container flex items-center space-x-1.5 bg-slate-200/70 dark:bg-[#111520] border border-slate-200/80 dark:border-[#1E2538] p-1.5 rounded-[16px]">
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('all')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        wishlistFilter === 'all'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
                      }`}
                    >
                      {language === 'id' ? 'Semua' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('planned')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        wishlistFilter === 'planned'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
                      }`}
                    >
                      {language === 'id' ? 'Rencana' : 'Planned'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlistFilter('purchased')}
                      className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                        wishlistFilter === 'purchased'
                          ? 'bg-white dark:bg-[#1E2435] text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white font-medium'
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
                setAssetCategoryDropdownOpen(false);
                setAssetPocketDropdownOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141824] rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto scrollbar-none transform-gpu will-change-transform"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {editingAsset
                  ? language === 'id' ? 'Edit Data Aset' : 'Edit Asset'
                  : language === 'id' ? 'Tambah Aset Baru' : 'Add New Asset'}
              </h3>

              {/* Mode Selector: Aset Manual vs Dari Kantong */}
              {!editingAsset && (
                <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-4 border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setAddAssetSourceType('new');
                      setNewAssetError(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      addAssetSourceType === 'new'
                        ? 'bg-white dark:bg-[#1C2233] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {language === 'id' ? 'Aset Manual' : 'Manual Asset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddAssetSourceType('from_pocket');
                      setNewAssetError(null);
                      const available = pockets.filter((p) => !p.isAsset);
                      if (available.length > 0 && !selectedPocketForAsset) {
                        setSelectedPocketForAsset(available[0].id);
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      addAssetSourceType === 'from_pocket'
                        ? 'bg-white dark:bg-[#1C2233] text-[#635BFF] dark:text-[#827CFF] shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {language === 'id' ? 'Dari Kantong Saya' : 'From My Pocket'}
                  </button>
                </div>
              )}

              {!editingAsset && addAssetSourceType === 'from_pocket' ? (
                <div className="space-y-4">
                  {/* Select Pocket Dropdown */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      {language === 'id' ? 'Pilih Kantong untuk Dijadikan Aset' : 'Select Pocket to Convert to Asset'}
                    </label>

                    {(() => {
                      const availablePockets = pockets.filter((p) => !p.isAsset);
                      if (availablePockets.length === 0) {
                        return (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                            {language === 'id'
                              ? 'Semua kantong Anda saat ini sudah berlabel aset atau belum ada kantong.'
                              : 'All your pockets are already labeled as assets or no pockets exist.'}
                          </div>
                        );
                      }

                      const currentSelected = availablePockets.find((p) => p.id === selectedPocketForAsset) || availablePockets[0];

                      return (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectPocketDropdownOpen(!selectPocketDropdownOpen)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                style={{ backgroundColor: currentSelected?.color || '#635BFF' }}
                              >
                                <WalletCards className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 text-left">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white block truncate">
                                  {currentSelected?.name}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                                  Saldo: {formatCurrency(currentSelected?.balance || 0)}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${selectPocketDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {selectPocketDropdownOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setSelectPocketDropdownOpen(false)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto scrollbar-none"
                                >
                                  {availablePockets.map((pkt) => {
                                    const isChosen = pkt.id === currentSelected?.id;
                                    return (
                                      <button
                                        key={pkt.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedPocketForAsset(pkt.id);
                                          setSelectPocketDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                                          isChosen ? 'bg-[#635BFF]/10 text-[#635BFF]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                          <div
                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                            style={{ backgroundColor: pkt.color }}
                                          >
                                            <WalletCards className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                                              {pkt.name}
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                              {formatCurrency(pkt.balance)}
                                            </span>
                                          </div>
                                        </div>
                                        {isChosen && <Check className="w-4 h-4 text-[#635BFF]" />}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Informational Callout */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111520] border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {language === 'id'
                        ? 'Kantong yang dipilih akan otomatis dimasukkan ke dalam Portofolio Aset & Total Kekayaan, dan saldonya tidak lagi dihitung di Total Saldo Tersedia di Beranda.'
                        : 'Selected pocket will be categorized as an Asset in your portfolio, and its balance excluded from available home balance.'}
                    </p>
                  </div>

                  {/* Action Buttons for from_pocket */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAssetModal(false);
                        setSelectedPocketForAsset('');
                        setSelectPocketDropdownOpen(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={pockets.filter((p) => !p.isAsset).length === 0}
                      onClick={() => {
                        const targetPktId = selectedPocketForAsset || pockets.filter((p) => !p.isAsset)[0]?.id;
                        if (!targetPktId) return;
                        const targetPkt = pockets.find((p) => p.id === targetPktId);
                        updatePocket(targetPktId, { isAsset: true });
                        setShowAddAssetModal(false);
                        setSelectedPocketForAsset('');
                        setToastMessage(
                          language === 'id'
                            ? `Kantong "${targetPkt?.name}" berhasil dijadikan sebagai Aset!`
                            : `Pocket "${targetPkt?.name}" converted to Asset!`
                        );
                        setTimeout(() => setToastMessage(null), 2400);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'id' ? 'Jadikan Aset' : 'Convert to Asset'}
                    </button>
                  </div>
                </div>
              ) : (
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

                {/* Custom In-App Dropdown: Kategori Aset */}
                {(() => {
                  const selectedCategoryMeta = ASSET_CATEGORIES.find((c) => c.id === newAssetCategory) || ASSET_CATEGORIES[0];
                  const SelectedCatIcon = selectedCategoryMeta.icon;

                  return (
                    <div className="relative">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        {language === 'id' ? 'Kategori Aset' : 'Asset Category'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAssetCategoryDropdownOpen(!assetCategoryDropdownOpen);
                          setAssetPocketDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border transition-all cursor-pointer ${
                          assetCategoryDropdownOpen
                            ? 'border-[#635BFF] ring-2 ring-[#635BFF]/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedCategoryMeta.colorClasses.bg} ${selectedCategoryMeta.colorClasses.text}`}>
                            <SelectedCatIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {language === 'id' ? selectedCategoryMeta.labelId : selectedCategoryMeta.labelEn}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${assetCategoryDropdownOpen ? 'rotate-180 text-[#635BFF]' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {assetCategoryDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setAssetCategoryDropdownOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto scrollbar-none transform-gpu"
                            >
                              {ASSET_CATEGORIES.map((cat) => {
                                const isSelected = newAssetCategory === cat.id;
                                const CatIcon = cat.icon;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setNewAssetCategory(cat.id);
                                      setAssetCategoryDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#827CFF]'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 dark:active:bg-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5 truncate">
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.colorClasses.bg} ${cat.colorClasses.text}`}>
                                        <CatIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="truncate">
                                        {language === 'id' ? cat.labelId : cat.labelEn}
                                      </span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#635BFF] flex-shrink-0 ml-2" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

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
                  <div className="relative">
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

                    <button
                      type="button"
                      onClick={() => {
                        setAssetPocketDropdownOpen(!assetPocketDropdownOpen);
                        setAssetCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border transition-all cursor-pointer ${
                        assetPocketDropdownOpen
                          ? 'border-[#635BFF] ring-2 ring-[#635BFF]/20'
                          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                          <WalletCards className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {newAssetPocketId === 'none'
                            ? language === 'id'
                              ? 'Jangan potong dari kantong manapun'
                              : 'Do not deduct from any pocket'
                            : (() => {
                                const p = pockets.find((pkt) => pkt.id === newAssetPocketId);
                                return p ? `${p.name} — Saldo: ${formatCurrency(p.balance)}` : 'Pilih Kantong';
                              })()}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${assetPocketDropdownOpen ? 'rotate-180 text-[#635BFF]' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {assetPocketDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setAssetPocketDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#181E2E] border border-slate-200 dark:border-[#273047] rounded-xl p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto scrollbar-none transform-gpu"
                          >
                            {/* Opsi: Jangan potong saldo */}
                            <button
                              type="button"
                              onClick={() => {
                                setNewAssetPocketId('none');
                                setNewAssetError(null);
                                setAssetPocketDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                newAssetPocketId === 'none'
                                  ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#827CFF]'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 dark:active:bg-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <span className="text-slate-400 font-bold">—</span>
                                <span className="truncate">
                                  {language === 'id'
                                    ? 'Jangan potong dari kantong manapun'
                                    : 'Do not deduct from any pocket'}
                                </span>
                              </div>
                              {newAssetPocketId === 'none' && <Check className="w-4 h-4 text-[#635BFF] flex-shrink-0 ml-2" />}
                            </button>

                            {/* Daftar Kantong Pengguna */}
                            {pockets.map((p) => {
                              const isSelected = newAssetPocketId === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setNewAssetPocketId(p.id);
                                    setNewAssetError(null);
                                    setAssetPocketDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#827CFF]'
                                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 dark:active:bg-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 truncate min-w-0 pr-2">
                                    <span className="font-bold truncate text-slate-900 dark:text-white">
                                      {p.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                      Saldo: {formatCurrency(p.balance)}
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 text-[#635BFF] ml-1" />}
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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
                      setAssetCategoryDropdownOpen(false);
                      setAssetPocketDropdownOpen(false);
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
              )}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
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
