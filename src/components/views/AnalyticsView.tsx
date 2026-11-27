'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  ChevronLeft,
  User,
  ChevronDown,
  Car,
  Landmark,
  Utensils,
  ShoppingBag,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  Film,
  ArrowLeftRight,
  MoreHorizontal,
  Check,
  TrendingDown,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { TimeFilter, AnalyticType, Transaction } from '@/types';

// Helper for smooth Catmull-Rom to Cubic Bezier curve conversion
function getSplinePath(points: { x: number; y: number }[]): { linePath: string; areaPath: string } {
  if (points.length === 0) return { linePath: '', areaPath: '' };
  if (points.length === 1) {
    return {
      linePath: `M ${points[0].x} ${points[0].y}`,
      areaPath: `M ${points[0].x} ${points[0].y} L ${points[0].x} 140 Z`,
    };
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const linePath = d;
  const areaPath = `${d} L ${points[points.length - 1].x.toFixed(1)} 140 L ${points[0].x.toFixed(1)} 140 Z`;

  return { linePath, areaPath };
}

export const AnalyticsView: React.FC = () => {
  const { setActiveTab, transactions, setSelectedTransaction, budgets, setActiveModal } = useFinance();
  const { language, t } = useLanguage();
  const [activeType, setActiveType] = useState<AnalyticType>('expenses');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setExpandedCategory((prev) => (prev === cat ? null : cat));
  };

  // Helper for category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5 stroke-[2]" />;
      case 'bill':
        return <Wifi className="w-5 h-5 stroke-[2]" />;
      case 'salary':
        return <ArrowDownLeft className="w-5 h-5 stroke-[2]" />;
      case 'travel':
        return <Car className="w-5 h-5 stroke-[2]" />;
      case 'investment':
        return <Landmark className="w-5 h-5 stroke-[2]" />;
      case 'food':
        return <Utensils className="w-5 h-5 stroke-[2]" />;
      case 'entertainment':
        return <Film className="w-5 h-5 stroke-[2]" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 stroke-[2]" />;
      default:
        return <MoreHorizontal className="w-5 h-5 stroke-[2]" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'shopping':
        return t('shopping');
      case 'bill':
        return t('bill');
      case 'salary':
        return t('salary');
      case 'travel':
        return t('travel');
      case 'investment':
        return t('investment');
      case 'food':
        return t('food');
      case 'entertainment':
        return language === 'id' ? 'Hiburan' : 'Entertainment';
      case 'transfer':
        return t('fund_transfer');
      default:
        return language === 'id' ? 'Lainnya' : 'Other';
    }
  };

  // Dynamic calculations from transactions
  const now = React.useMemo(() => new Date(), []);

  // Periods generator based on timeFilter
  const periods = React.useMemo(() => {
    if (timeFilter === 'monthly') {
      const list = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const monthNum = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${monthNum}`;
        const label = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
        const fullLabel = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
        list.push({
          key,
          label,
          fullLabel,
          filterFn: (tx: Transaction) => tx.date.startsWith(key),
        });
      }
      return list;
    } else if (timeFilter === 'weekly') {
      const dayOfWeek = now.getDay();
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
      const list = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const label = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });
        const fullLabel = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        list.push({
          key,
          label,
          fullLabel,
          filterFn: (tx: Transaction) => tx.date === key,
        });
      }
      return list;
    } else {
      // yearly
      const currentYear = now.getFullYear();
      const list = [];
      for (let i = 4; i >= 0; i--) {
        const yr = currentYear - i;
        const key = `${yr}`;
        list.push({
          key,
          label: `${yr}`,
          fullLabel: language === 'id' ? `Tahun ${yr}` : `Year ${yr}`,
          filterFn: (tx: Transaction) => tx.date.startsWith(key),
        });
      }
      return list;
    }
  }, [timeFilter, language, now]);

  // Selected period index (default to current period, e.g. last item or today)
  const defaultIndex = React.useMemo(() => {
    if (timeFilter === 'weekly') {
      const dayOfWeek = now.getDay();
      return (dayOfWeek + 6) % 7;
    }
    return periods.length - 1;
  }, [timeFilter, periods.length, now]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultIndex);

  // Keep selectedIndex in sync when timeFilter changes
  useEffect(() => {
    setSelectedIndex(defaultIndex);
  }, [defaultIndex]);

  const selectedPeriod = periods[selectedIndex] || periods[periods.length - 1];

  // Aggregated amounts for the chart curve across all periods in view
  const chartAmounts = React.useMemo(() => {
    return periods.map((p) => {
      return transactions
        .filter(
          (tx) =>
            p.filterFn(tx) &&
            (activeType === 'expenses' ? tx.type === 'expense' : tx.type === 'income') &&
            tx.category !== 'transfer'
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
    });
  }, [periods, transactions, activeType]);

  // Coordinate calculations
  const maxVal = Math.max(...chartAmounts, 0);
  const padX = 20;
  const chartWidth = 340;
  const stepX = (chartWidth - 2 * padX) / Math.max(periods.length - 1, 1);
  const yBase = 115;
  const yTop = 32;

  const points = React.useMemo(() => {
    return chartAmounts.map((amt, idx) => {
      const x = padX + idx * stepX;
      const y = maxVal === 0 ? yBase : yBase - (amt / maxVal) * (yBase - yTop);
      return { x, y, amount: amt };
    });
  }, [chartAmounts, maxVal, stepX]);

  const spline = React.useMemo(() => getSplinePath(points), [points]);
  const activePoint = points[selectedIndex] || points[points.length - 1] || { x: 170, y: yBase, amount: 0 };
  const pillPercent = Math.min(Math.max((activePoint.x / chartWidth) * 100, 16), 84);

  // Current selected period transactions for cards & breakdowns
  const selectedPeriodTx = React.useMemo(() => {
    if (!selectedPeriod) return [];
    return transactions.filter((tx) => selectedPeriod.filterFn(tx));
  }, [transactions, selectedPeriod]);

  const totalPeriodExpense = React.useMemo(() => {
    return selectedPeriodTx
      .filter((tx) => tx.type === 'expense' && tx.category !== 'transfer')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [selectedPeriodTx]);

  const totalPeriodIncome = React.useMemo(() => {
    return selectedPeriodTx
      .filter((tx) => tx.type === 'income' && tx.category !== 'transfer')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [selectedPeriodTx]);

  const netCashflow = totalPeriodIncome - totalPeriodExpense;

  // Breakdown by category for activeType in selected period
  const filteredTypeTx = React.useMemo(() => {
    return selectedPeriodTx.filter(
      (tx) =>
        (activeType === 'expenses' ? tx.type === 'expense' : tx.type === 'income') &&
        tx.category !== 'transfer'
    );
  }, [selectedPeriodTx, activeType]);

  const categoryAggregated = React.useMemo(() => {
    const agg: Record<string, { total: number; count: number }> = {};
    filteredTypeTx.forEach((tx) => {
      if (!agg[tx.category]) {
        agg[tx.category] = { total: 0, count: 0 };
      }
      agg[tx.category].total += tx.amount;
      agg[tx.category].count += 1;
    });
    return agg;
  }, [filteredTypeTx]);

  // Breakdown by category directly from real transactions
  const displayedCategories = React.useMemo(() => {
    return Object.entries(categoryAggregated).map(([cat, data]) => ({
      category: cat,
      amount: data.total,
      count: data.count,
    }));
  }, [categoryAggregated]);

  const totalFilteredAmount = displayedCategories.reduce((sum, c) => sum + c.amount, 0);

  // Helper to format transaction date
  const formatTxDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper to get transactions belonging to a category
  const getCategoryTransactions = (cat: string) => {
    const currentMonthMatches = selectedPeriodTx.filter(
      (tx) =>
        tx.category === cat &&
        (activeType === 'expenses' ? tx.type === 'expense' : tx.type === 'income')
    );
    if (currentMonthMatches.length > 0) return currentMonthMatches;

    return transactions.filter(
      (tx) =>
        tx.category === cat &&
        (activeType === 'expenses' ? tx.type === 'expense' : tx.type === 'income')
    );
  };

  return (
    <div className="flex flex-col h-full text-slate-900 dark:text-white w-full min-h-0 space-y-3.5">
      {/* 1. Fixed Top Section: Header & Tab Switcher (Does not scroll) */}
      <div className="flex flex-col space-y-3 flex-shrink-0 pt-1">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'id' ? 'Analisis Keuangan' : 'Financial Analytics'}
          </h1>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
            aria-label="Profile"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Expenses / Income Tab Switcher (Fixed) */}
        <LayoutGroup id="analyticsTabGroup">
          <div className="tab-container flex items-center bg-slate-200/70 dark:bg-[#111520] border border-slate-200/80 dark:border-[#1E2538] p-1.5 rounded-[18px] relative">
            <button
              type="button"
              onClick={() => {
                setActiveType('expenses');
                setExpandedCategory(null);
              }}
              className="relative flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-[14px] transition-colors cursor-pointer z-10 flex items-center justify-center space-x-1.5"
            >
              {activeType === 'expenses' && (
                <motion.div
                  layoutId="activeAnalyticTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-[#1E2435] rounded-[14px] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span
                className={`transition-colors duration-200 ${
                  activeType === 'expenses'
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-500 dark:text-[#677491] hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {t('expenses')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveType('income');
                setExpandedCategory(null);
              }}
              className="relative flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-[14px] transition-colors cursor-pointer z-10 flex items-center justify-center space-x-1.5"
            >
              {activeType === 'income' && (
                <motion.div
                  layoutId="activeAnalyticTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-[#1E2435] rounded-[14px] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span
                className={`transition-colors duration-200 ${
                  activeType === 'income'
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-500 dark:text-[#677491] hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {language === 'id' ? 'Pemasukan' : 'Income'}
              </span>
            </button>
          </div>
        </LayoutGroup>
      </div>

      {/* 2. Scrollable Body Content (Month selector, Chart, Summary, & Category cards) */}
      <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 space-y-4 pb-6 sm:pb-8 pr-0.5 pt-1">
        {/* 3. Month Header & Period Selector */}
      <div className="flex items-center justify-between pt-1 relative">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {selectedPeriod?.fullLabel || ''}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-[#7A87A5] hover:text-slate-900 dark:hover:text-white font-medium bg-white dark:bg-[#141824] px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
          >
            <span>{timeFilter === 'monthly' ? t('monthly') : timeFilter === 'weekly' ? t('weekly') : t('yearly')}</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1A2030] rounded-xl shadow-xl z-20 py-1 overflow-hidden">
              {(['monthly', 'weekly', 'yearly'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-800 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#232B3E] capitalize cursor-pointer"
                >
                  <span>{filter === 'monthly' ? t('monthly') : filter === 'weekly' ? t('weekly') : t('yearly')}</span>
                  {timeFilter === filter && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Dynamic Spline Area Chart (Pengeluaran vs Pemasukan) */}
      <div className="relative w-full h-[175px] flex flex-col justify-end pt-2">
        <div className="relative w-full h-[135px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 340 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradientExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#635BFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#635BFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="chartGradientIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1="0" y1="35" x2="340" y2="35" stroke="currentColor" className="text-slate-200 dark:text-[#181E2E]" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="85" x2="340" y2="85" stroke="currentColor" className="text-slate-200 dark:text-[#181E2E]" strokeWidth="1" strokeDasharray="3 3" />

            {/* Filled Area */}
            <motion.path
              initial={false}
              animate={{
                d: spline.areaPath,
                fill: activeType === 'expenses' ? 'url(#chartGradientExpense)' : 'url(#chartGradientIncome)',
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Stroke Line */}
            <motion.path
              initial={false}
              animate={{
                d: spline.linePath,
                stroke: activeType === 'expenses' ? '#635BFF' : '#10B981',
                opacity: maxVal === 0 ? 0.35 : 1,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              fill="none"
              strokeWidth={maxVal === 0 ? 1.5 : 3}
              strokeLinecap="round"
            />

            {/* Highlight Point */}
            <motion.circle
              initial={false}
              animate={{
                cx: activePoint.x,
                cy: activePoint.y,
                fill: activeType === 'expenses' ? '#635BFF' : '#10B981',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              r="5"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>

          {/* Floating Highlight Pill */}
          <motion.div
            initial={false}
            animate={{
              left: `${pillPercent}%`,
              top: `${Math.max(0, activePoint.y - 36)}px`,
              backgroundColor: activeType === 'expenses' ? '#635BFF' : '#10B981',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="absolute -translate-x-1/2 !text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-sm flex items-center space-x-1 pointer-events-none z-10"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`${activeType}-${selectedIndex}-${activePoint.amount}`}
                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="!text-white font-bold"
              >
                {formatCurrency(activePoint.amount)}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* X-axis Labels */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#5D6B87] font-medium pt-3 px-2">
          {periods.map((p, idx) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`transition-colors cursor-pointer text-center flex-1 py-1 ${
                idx === selectedIndex
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="block leading-none">{p.label}</span>
              {idx === selectedIndex && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] dark:bg-white mx-auto mt-1 block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Ringkasan Keuangan Periode Terpilih */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141824] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2435]">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'id'
              ? `Ringkasan Keuangan (${selectedPeriod?.fullLabel || 'Periode Ini'})`
              : `Financial Summary (${selectedPeriod?.fullLabel || 'This Period'})`}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              netCashflow >= 0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
            }`}
          >
            {language === 'id' ? 'Arus Kas' : 'Cashflow'}: {netCashflow >= 0 ? '+' : ''}
            {formatCurrency(netCashflow)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          {/* Total Pemasukan */}
          <button
            type="button"
            onClick={() => {
              setActiveType('income');
              setExpandedCategory(null);
            }}
            className={`flex items-center space-x-2.5 p-2 rounded-xl transition-all cursor-pointer text-left ${
              activeType === 'income'
                ? 'bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-[#111520]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-[#10B981] flex-shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] block leading-tight font-medium">
                {language === 'id' ? 'Pemasukan' : 'Income'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-[#10B981]">
                +{formatCurrency(totalPeriodIncome)}
              </span>
            </div>
          </button>

          {/* Total Pengeluaran */}
          <button
            type="button"
            onClick={() => {
              setActiveType('expenses');
              setExpandedCategory(null);
            }}
            className={`flex items-center space-x-2.5 p-2 rounded-xl transition-all cursor-pointer text-left ${
              activeType === 'expenses'
                ? 'bg-rose-500/10 shadow-xs ring-1 ring-rose-500/20'
                : 'bg-slate-50 dark:bg-[#111520]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-[#F43F5E] flex-shrink-0">
              <TrendingDown className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] block leading-tight font-medium">
                {language === 'id' ? 'Pengeluaran' : 'Expense'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#F43F5E]">
                -{formatCurrency(totalPeriodExpense)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 6. Riwayat Kategori (Category Breakdown by Active Tab) */}
      <div className="flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.h2
              key={activeType}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="text-base font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {language === 'id'
                ? `Rincian Kategori ${activeType === 'expenses' ? 'Pengeluaran' : 'Pemasukan'}`
                : `${activeType === 'expenses' ? 'Expense' : 'Income'} Categories`}
            </motion.h2>
          </AnimatePresence>
          <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium">
            {displayedCategories.length} {language === 'id' ? 'Kategori' : 'Categories'}
          </span>
        </div>

        {/* Animated Single column category cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, x: activeType === 'income' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeType === 'income' ? -20 : 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-2.5"
          >
            {displayedCategories.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#141824] border border-dashed border-slate-200 dark:border-[#222B42] flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1C2438] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                  <PieChart className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'id' ? 'Belum Ada Transaksi' : 'No Transactions Yet'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                  {language === 'id'
                    ? `Tidak ada transaksi ${activeType === 'expenses' ? 'pengeluaran' : 'pemasukan'} pada periode ini.`
                    : `No ${activeType === 'expenses' ? 'expense' : 'income'} transactions for this period.`}
                </p>
              </div>
            ) : (
              displayedCategories.map((item, idx) => {
                const isExpanded = expandedCategory === item.category;
                const categoryTxs = getCategoryTransactions(item.category);

                // Budget calculation for expense categories
                const catBudget =
                  activeType === 'expenses'
                    ? budgets.find((b) => b.category === item.category && b.monthlyLimit > 0)
                    : null;
                const hasBudget = !!catBudget;
                const budgetLimit = catBudget ? catBudget.monthlyLimit : 0;
                const isOverBudget = hasBudget && item.amount > budgetLimit;

                // Percentage: linked to budget for expenses if set; or % of total for income
                const pct = hasBudget
                  ? Math.round((item.amount / budgetLimit) * 100)
                  : activeType === 'income' && totalFilteredAmount > 0
                  ? Math.round((item.amount / totalFilteredAmount) * 100)
                  : 0;

                return (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-2xl bg-white dark:bg-[#141824] transition-all duration-200 overflow-hidden shadow-xs"
                  >
                    {/* Clickable Header that toggles accordion */}
                    <div
                      onClick={() => toggleCategory(item.category)}
                      className="p-3.5 cursor-pointer flex flex-col justify-between select-none"
                    >
                      {/* Top Row: Icon, Category Name, Tx Count, Nominal, Percentage & Chevron */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-colors ${
                              activeType === 'expenses'
                                ? 'bg-rose-50 text-[#F43F5E] dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}
                          >
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {getCategoryLabel(item.category)}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                              {item.count} {language === 'id' ? 'transaksi' : 'transactions'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <span
                              className={`text-sm font-extrabold block ${
                                activeType === 'expenses'
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-emerald-600 dark:text-[#10B981]'
                              }`}
                            >
                              {activeType === 'expenses' ? '-' : '+'}
                              {formatCurrency(item.amount)}
                            </span>
                            {activeType === 'expenses' ? (
                              hasBudget ? (
                                <span
                                  className={`text-[11px] font-bold block ${
                                    isOverBudget
                                      ? 'text-[#F43F5E]'
                                      : 'text-slate-500 dark:text-[#7B88A6]'
                                  }`}
                                >
                                  {pct}% {language === 'id' ? 'budget' : 'budget'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400 dark:text-[#5E6D8B] italic block">
                                  {language === 'id' ? 'Belum ada budget' : 'No budget'}
                                </span>
                              )
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">
                                {pct}%
                              </span>
                            )}
                          </div>

                          {/* Chevron toggle indicator */}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                              isExpanded
                                ? 'rotate-180 text-[#635BFF]'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Percentage Bar or No-Budget prompt */}
                      {activeType === 'expenses' ? (
                        hasBudget ? (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px] mb-1 font-medium text-slate-400 dark:text-[#64728E]">
                              <span>
                                {isOverBudget
                                  ? language === 'id'
                                    ? 'Melebihi budget!'
                                    : 'Over budget!'
                                  : `${language === 'id' ? 'Terpakai' : 'Spent'}: ${formatCurrency(item.amount)}`}
                              </span>
                              <span>
                                {language === 'id' ? 'Batas' : 'Limit'}: {formatCurrency(budgetLimit)}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-[#1E2435] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, pct)}%` }}
                                transition={{
                                  duration: 0.55,
                                  delay: 0.08 + idx * 0.04,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className={`h-full rounded-full ${
                                  isOverBudget ? 'bg-red-500' : 'bg-[#F43F5E]'
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1E2435] text-[11px]">
                            <span className="text-slate-400 dark:text-[#5E6D8B] text-[10px]">
                              {language === 'id' ? 'Batasan budget belum ditentukan' : 'Budget limit not set'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModal('monthlyBudget');
                              }}
                              className="text-[#635BFF] hover:underline font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                            >
                              <span>+ {language === 'id' ? 'Atur Budget' : 'Set Budget'}</span>
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-2 bg-slate-100 dark:bg-[#1E2435] rounded-full mt-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.55,
                              delay: 0.08 + idx * 0.04,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="h-full rounded-full bg-[#10B981]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Accordion Content with smooth height animation */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="accordion-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden bg-slate-50/70 dark:bg-[#0F131C] border-t border-slate-100 dark:border-[#1E2435]"
                        >
                          <div className="p-3.5 flex flex-col space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#7B88A6] px-0.5">
                              <span>
                                {language === 'id' ? 'Daftar Transaksi' : 'Transaction List'} ({categoryTxs.length})
                              </span>
                              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                {language === 'id' ? 'Klik untuk rincian' : 'Click for details'}
                              </span>
                            </div>

                            {categoryTxs.length === 0 ? (
                              <div className="text-center py-3 text-xs text-slate-400 dark:text-slate-500">
                                {language === 'id'
                                  ? 'Belum ada rincian riwayat transaksi'
                                  : 'No transaction history details'}
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-1.5">
                                {categoryTxs.map((tx) => (
                                  <div
                                    key={tx.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTransaction(tx);
                                    }}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100/80 dark:bg-[#151A26] dark:hover:bg-[#1C2233] cursor-pointer transition-all active:scale-[0.99] group shadow-2xs"
                                  >
                                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          tx.type === 'expense'
                                            ? 'bg-rose-100 text-[#F43F5E] dark:bg-rose-950/60 dark:text-rose-400'
                                            : 'bg-emerald-100 text-[#10B981] dark:bg-emerald-950/60 dark:text-emerald-400'
                                        }`}
                                      >
                                        {getCategoryIcon(tx.category)}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block group-hover:text-[#635BFF] transition-colors">
                                          {tx.title}
                                        </span>
                                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-[#7B88A6] mt-0.5">
                                          <span>{formatTxDate(tx.date)}</span>
                                          {tx.time && (
                                            <>
                                              <span>•</span>
                                              <span>{tx.time}</span>
                                            </>
                                          )}
                                          {(tx.pocketName || tx.cardNumber) && (
                                            <>
                                              <span>•</span>
                                              <span className="text-[#635BFF] dark:text-[#8E87FF] font-medium truncate max-w-[100px]">
                                                {tx.pocketName ? `Kantong ${tx.pocketName}` : tx.cardNumber}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                      <span
                                        className={`text-xs font-bold ${
                                          tx.type === 'expense'
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-emerald-600 dark:text-[#10B981]'
                                        }`}
                                      >
                                        {tx.type === 'expense' ? '-' : '+'}
                                        {formatCurrency(tx.amount)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};
