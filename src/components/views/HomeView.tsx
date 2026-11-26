'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  User,
  Shield,
  Wallet,
  Landmark,
  Plane,
  Smartphone,
  Heart,
  ShoppingBag,
  Car,
  Home as HomeIcon,
  Briefcase,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Building2,
  Utensils,
  Plus,
  Check,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatTxDateTime } from '@/lib/utils';
import { Transaction, Pocket } from '@/types';

const renderPocketIcon = (name: string) => {
  switch (name) {
    case 'Wallet':
      return <Wallet className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Landmark':
      return <Landmark className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Plane':
      return <Plane className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Smartphone':
      return <Smartphone className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Heart':
      return <Heart className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'ShoppingBag':
      return <ShoppingBag className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Car':
      return <Car className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Home':
      return <HomeIcon className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    case 'Briefcase':
      return <Briefcase className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
    default:
      return <Shield className="w-3.5 h-3.5 text-white stroke-white stroke-[2.2]" />;
  }
};

interface PocketCardProps {
  pocket: Pocket;
  onSelect: () => void;
  targetLabel: string;
  isReorderMode: boolean;
  onStartReorder: () => void;
}

const ReorderablePocketCard: React.FC<PocketCardProps> = ({
  pocket,
  onSelect,
  targetLabel,
  isReorderMode,
  onStartReorder,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = useRef(false);

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((pocket.balance / (pocket.targetAmount || 1)) * 100))
  );

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
      value={pocket}
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
          ? { scale: 1.08, rotate: 0, zIndex: 50 }
          : isReorderMode
            ? {
                rotate: [-1.4, 1.4, -1.4],
                transition: {
                  repeat: Infinity,
                  duration: 0.22,
                  ease: 'easeInOut',
                },
              }
            : { scale: 1, rotate: 0, zIndex: 1 }
      }
      whileDrag={{
        scale: 1.08,
        rotate: 0,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        zIndex: 50,
      }}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`pocket-card min-w-[165px] sm:min-w-[175px] max-w-[190px] flex-shrink-0 snap-start p-3.5 rounded-[20px] transition-shadow select-none ${
        isReorderMode ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-pointer active:scale-[0.98]'
      } flex flex-col justify-between group relative overflow-hidden ${
        isDragging
          ? 'ring-2 ring-white/90 shadow-2xl z-50'
          : isReorderMode
            ? 'ring-2 ring-white/60 shadow-lg'
            : 'shadow-sm'
      }`}
      style={{ backgroundColor: pocket.color }}
      title={pocket.name}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="w-7 h-7 rounded-[10px] pocket-card-badge flex items-center justify-center shadow-xs">
            {renderPocketIcon(pocket.iconName)}
          </div>
          <div className="flex items-center space-x-1.5">
            {pocket.isAsset && (
              <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-xs flex items-center">
                Aset
              </span>
            )}
            <span className="text-[10px] font-bold pocket-card-badge px-2 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white tracking-tight truncate mt-2.5">
          {pocket.name}
        </h3>
        <p className="text-sm font-black text-white tracking-tight mt-0.5">
          {formatCurrency(pocket.balance)}
        </p>
        <p className="text-[11px] text-white/80 mt-0.5 truncate">
          {targetLabel}: {formatCurrency(pocket.targetAmount)}
        </p>
      </div>

      {/* Mini progress bar */}
      <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden mt-3">
        <div
          className="h-full rounded-full transition-all duration-500 bg-white"
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>
    </Reorder.Item>
  );
};

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    pockets,
    setSelectedPocket,
    setActiveTab,
    setActiveModal,
    setSelectedTransaction,
    reorderPockets,
    balanceCardColor,
  } = useFinance();
  const { language, t } = useLanguage();
  const [liveDate, setLiveDate] = useState<string>('');
  const [isReorderMode, setIsReorderMode] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setLiveDate(formatted);
  }, [language]);

  // Dynamic monthly income and expense
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthTransactions = transactions.filter((tx) =>
    tx.date ? tx.date.startsWith(currentMonthStr) : true
  );

  const thisMonthIncome = thisMonthTransactions
    .filter((tx) => tx.type === 'income' && tx.category !== 'transfer')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const thisMonthExpense = thisMonthTransactions
    .filter((tx) => tx.type === 'expense' && tx.category !== 'transfer')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const availablePocketBalance = pockets
    .filter((p) => !p.isAsset)
    .reduce((sum, p) => sum + p.balance, 0);

  const renderTxIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'travel':
        return <Car className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'investment':
        return <Building2 className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
      default:
        if (
          tx.iconName === 'ArrowRightLeft' ||
          tx.title?.toLowerCase().includes('transfer') ||
          tx.title?.toLowerCase().includes('pindah')
        ) {
          return <ArrowRightLeft className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
        }
        if (tx.type === 'income' || tx.iconName === 'ArrowDownLeft') {
          return <ArrowDownLeft className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
        }
        if (tx.type === 'expense' || tx.iconName === 'ArrowUpRight') {
          return <ArrowUpRight className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
        }
        return <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-white stroke-[2]" />;
    }
  };

  const getTranslatedCategory = (cat: string) => {
    if (cat === 'shopping') return t('shopping');
    if (cat === 'bill') return t('bill');
    if (cat === 'salary') return t('salary');
    if (cat === 'travel') return t('travel');
    if (cat === 'investment') return t('investment');
    if (cat === 'food') return t('food');
    return cat;
  };

  const displayTransactions = transactions.slice(0, 3);
  const isDefaultCardColor = !balanceCardColor || balanceCardColor === 'default';

  return (
    <div className="flex flex-col h-full text-slate-900 dark:text-white w-full min-h-0 space-y-4">
      {/* 1. Header (Fixed) */}
      <div className="flex items-center justify-between pt-1 flex-shrink-0">
        <div>
          <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium tracking-wide">{t('welcome_back')}</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 2. Main Balance Solid Card (Fixed) */}
      <div
        onClick={() => setActiveModal('customizeBalanceCard')}
        className={`relative overflow-hidden rounded-[24px] p-5 sm:p-6 text-white shadow-lg flex-shrink-0 cursor-pointer active:scale-[0.99] transition-all duration-200 group ${
          isDefaultCardColor
            ? 'bg-[#0F172A] dark:bg-[#635BFF] shadow-slate-900/10 dark:shadow-[#635BFF]/20'
            : 'shadow-slate-900/15'
        }`}
        style={!isDefaultCardColor ? { background: balanceCardColor } : undefined}
        title={language === 'id' ? 'Klik untuk ubah warna kartu' : 'Click to customize card color'}
      >
        <div className="relative z-10 flex flex-col justify-between space-y-3.5">
          {/* Card Top: Label & Live Date & Palette Icon */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 font-medium tracking-wide">
              {t('total_balance_available')}
            </span>
            <div className="flex items-center space-x-1.5">
              <span
                suppressHydrationWarning
                className="text-[11px] font-medium text-white/90 tracking-wide bg-white/15 px-2.5 py-0.5 rounded-full"
              >
                {liveDate || (language === 'id' ? 'Hari ini' : 'Today')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal('customizeBalanceCard');
                }}
                className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-all cursor-pointer"
                title={language === 'id' ? 'Ubah warna kartu' : 'Customize card color'}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Middle: Big Balance with Proportional Typography */}
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-xl sm:text-2xl font-bold text-white/80 select-none">
              Rp
            </span>
            <span
              suppressHydrationWarning
              className="text-3xl sm:text-[38px] font-extrabold text-white tracking-tight tabular-nums font-sans"
            >
              {Math.abs(Math.round(availablePocketBalance)).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Card Bottom: Rincian Pemasukan & Pengeluaran Bulan Ini (Click to see Analytics) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('analytics');
            }}
            className="pt-3 border-t border-white/15 flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 -mx-6 -mb-6 px-6 pb-4 pt-3 transition-colors group"
            title={language === 'id' ? 'Lihat Analisis Keuangan' : 'View Financial Analytics'}
          >
            {/* Pemasukan */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#34D399] stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('monthly_income')}
                </span>
                <span className="font-bold text-white text-[12px] sm:text-[13px] tracking-tight">
                  +{formatCurrency(thisMonthIncome)}
                </span>
              </div>
            </div>

            <div className="h-7 w-px bg-white/15" />

            {/* Pengeluaran */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-red-200 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block leading-tight font-medium">
                  {t('monthly_expense')}
                </span>
                <span className="font-bold text-white text-[12px] sm:text-[13px] tracking-tight">
                  -{formatCurrency(thisMonthExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Kantong Saya (My Pockets - Fixed Vertical, Horizontal Scroll) */}
      <div className="flex flex-col space-y-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('my_pockets')}</h2>
            {isReorderMode && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full animate-pulse">
                {language === 'id' ? 'Atur Urutan' : 'Reordering'}
              </span>
            )}
          </div>
          {isReorderMode ? (
            <button
              onClick={() => setIsReorderMode(false)}
              className="text-xs px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all flex items-center space-x-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{language === 'id' ? 'Selesai' : 'Done'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveModal('addPocket')}
              className="text-xs text-slate-500 dark:text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer font-medium flex items-center space-x-1"
            >
              <span>{t('add_pocket_btn')}</span>
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Pocket Cards (Long-press to Reorder) */}
        <Reorder.Group
          axis="x"
          values={pockets}
          onReorder={reorderPockets}
          className="flex space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-2 px-2"
        >
          {pockets.map((pocket) => (
            <ReorderablePocketCard
              key={pocket.id}
              pocket={pocket}
              onSelect={() => setSelectedPocket(pocket)}
              targetLabel={t('pocket_target_label')}
              isReorderMode={isReorderMode}
              onStartReorder={() => setIsReorderMode(true)}
            />
          ))}

          {pockets.length === 0 && (
            <div
              onClick={() => setActiveModal('addPocket')}
              className="min-w-[200px] flex-shrink-0 p-4 rounded-[20px] flex items-center justify-center text-center cursor-pointer transition-colors bg-white dark:bg-[#141824] shadow-sm"
            >
              <div className="flex flex-col items-center space-y-1">
                <Plus className="w-5 h-5 text-slate-400 dark:text-[#7B88A6]" />
                <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium">{t('add_pocket_btn')}</span>
              </div>
            </div>
          )}
        </Reorder.Group>
      </div>

      {/* 4. Transactions Section (Scrollable Vertically) */}
      <div className="flex-1 flex flex-col min-h-0 pt-1">
        <div className="flex items-center justify-between pb-2 flex-shrink-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('transactions')}</h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            {t('see_all')}
          </button>
        </div>

        {/* Scrollable Transaction Cards List ONLY (Aligned directly to navbar border with unclipped shadow) */}
        <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-2.5 pb-6 sm:pb-8 -mx-2 px-2 pt-1">
          {[...transactions]
            .sort((a, b) => {
              const timeA = a.timestamp || (a.date ? new Date(`${a.date} ${a.time || '00:00'}`).getTime() : 0);
              const timeB = b.timestamp || (b.date ? new Date(`${b.date} ${b.time || '00:00'}`).getTime() : 0);
              return timeB - timeA;
            })
            .map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-[20px] bg-white dark:bg-[#141824] hover:bg-slate-50 dark:hover:bg-[#181D2B] transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
              title="Click to view, edit, or delete"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center flex-shrink-0">
                  {renderTxIcon(tx)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    {tx.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#7B88A6] mt-0.5 font-medium">
                    {formatTxDateTime(tx.date, tx.time, language)}
                  </p>
                </div>
              </div>

              <div
                className={`text-sm font-bold tracking-tight ${
                  tx.category === 'transfer'
                    ? 'text-slate-600 dark:text-slate-300'
                    : tx.type === 'income'
                    ? 'text-[#10B981]'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {tx.category === 'transfer'
                  ? formatCurrency(tx.amount)
                  : tx.type === 'income'
                  ? `+${formatCurrency(tx.amount)}`
                  : `-${formatCurrency(tx.amount)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
