'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { CHART_DATA } from '@/lib/dummyData';
import { TimeFilter, AnalyticType, Transaction } from '@/types';

export const AnalyticsView: React.FC = () => {
  const { setActiveTab, transactions } = useFinance();
  const { language, t } = useLanguage();
  const [activeType, setActiveType] = useState<AnalyticType>('expenses');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
  const [showDropdown, setShowDropdown] = useState(false);

  const currentChart = CHART_DATA[timeFilter];

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
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTx = transactions.filter((tx) => tx.date.startsWith(currentMonthStr));
  const totalMonthExpense = currentMonthTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalMonthIncome = currentMonthTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const netCashflow = totalMonthIncome - totalMonthExpense;

  // Breakdown by category for activeType
  const filteredTypeTx = currentMonthTx.filter((tx) =>
    activeType === 'expenses' ? tx.type === 'expense' : tx.type === 'income'
  );

  const categoryAggregated: Record<string, { total: number; count: number }> = {};
  filteredTypeTx.forEach((tx) => {
    if (!categoryAggregated[tx.category]) {
      categoryAggregated[tx.category] = { total: 0, count: 0 };
    }
    categoryAggregated[tx.category].total += tx.amount;
    categoryAggregated[tx.category].count += 1;
  });

  // Fallback defaults if no transactions this month to ensure lively presentation
  const displayedCategories =
    Object.keys(categoryAggregated).length > 0
      ? Object.entries(categoryAggregated).map(([cat, data]) => ({
          category: cat,
          amount: data.total,
          count: data.count,
        }))
      : activeType === 'expenses'
      ? [
          { category: 'food', amount: 157, count: 4 },
          { category: 'travel', amount: 126, count: 2 },
          { category: 'investment', amount: 115, count: 1 },
          { category: 'shopping', amount: 36, count: 1 },
          { category: 'bill', amount: 44, count: 1 },
        ]
      : [
          { category: 'salary', amount: 2500, count: 1 },
          { category: 'investment', amount: 300, count: 1 },
        ];

  const totalFilteredAmount = displayedCategories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col space-y-4 text-slate-900 dark:text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#23293A] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          {language === 'id' ? 'Analisis Keuangan' : 'Financial Analytics'}
        </h1>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#23293A] flex items-center justify-center text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 2. Expenses / Income Tab Switcher (Card Saldo Atas Dihilangkan) */}
      <div className="flex items-center bg-slate-100 dark:bg-[#111520] p-1.5 rounded-[18px] border border-slate-200 dark:border-[#1B2130]">
        <button
          onClick={() => setActiveType('expenses')}
          className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-[14px] transition-all cursor-pointer ${
            activeType === 'expenses'
              ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1E2435] shadow-xs'
              : 'text-slate-500 dark:text-[#677491] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('expenses')}
        </button>
        <button
          onClick={() => setActiveType('income')}
          className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-[14px] transition-all cursor-pointer ${
            activeType === 'income'
              ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1E2435] shadow-xs'
              : 'text-slate-500 dark:text-[#677491] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'id' ? 'Pemasukan' : 'Income'}
        </button>
      </div>

      {/* 3. Month Header & Period Selector */}
      <div className="flex items-center justify-between pt-1 relative">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {timeFilter === 'monthly'
            ? language === 'id'
              ? 'Maret, 2023'
              : 'March, 2023'
            : timeFilter === 'weekly'
            ? language === 'id'
              ? 'Minggu Ini'
              : 'This Week'
            : language === 'id'
            ? 'Tahun 2023'
            : 'Year 2023'}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-[#7A87A5] hover:text-slate-900 dark:hover:text-white font-medium bg-white dark:bg-[#141824] px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#1E2435] transition-colors cursor-pointer shadow-xs"
          >
            <span>{timeFilter === 'monthly' ? t('monthly') : timeFilter === 'weekly' ? t('weekly') : t('yearly')}</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1A2030] border border-slate-200 dark:border-[#273045] rounded-xl shadow-xl z-20 py-1 overflow-hidden">
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
            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100 L 340 140 L 0 140 Z'
                  : 'M 0 110 C 60 90, 100 25, 140 25 C 190 25, 240 70, 290 40 C 320 30, 335 50, 340 50 L 340 140 L 0 140 Z'
              }
              fill={activeType === 'expenses' ? 'url(#chartGradientExpense)' : 'url(#chartGradientIncome)'}
            />

            {/* Stroke Line */}
            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100'
                  : 'M 0 110 C 60 90, 100 25, 140 25 C 190 25, 240 70, 290 40 C 320 30, 335 50, 340 50'
              }
              fill="none"
              stroke={activeType === 'expenses' ? '#635BFF' : '#10B981'}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Highlight Point */}
            <circle
              cx={activeType === 'expenses' ? '95' : '140'}
              cy="25"
              r="5"
              fill={activeType === 'expenses' ? '#635BFF' : '#10B981'}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>

          {/* Floating Highlight Pill */}
          <div
            className={`absolute top-[-10px] -translate-x-1/2 !text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-sm flex items-center space-x-1 pointer-events-none ${
              activeType === 'expenses' ? 'left-[28%] bg-[#635BFF]' : 'left-[41%] bg-[#10B981]'
            }`}
          >
            <span className="!text-white font-bold">
              {formatCurrency(
                activeType === 'expenses' ? currentChart.highlightExpense : currentChart.highlightIncome
              )}
            </span>
          </div>
        </div>

        {/* X-axis Labels */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#5D6B87] font-medium pt-3 px-1">
          {currentChart.labels.map((lbl, idx) => (
            <span
              key={lbl}
              className={`transition-colors ${
                idx === currentChart.highlightIndex ? 'text-slate-900 dark:text-white font-semibold' : ''
              }`}
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* 5. Ringkasan Keuangan Bulan Ini (Monthly Financial Summary) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2435]">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'id' ? 'Ringkasan Keuangan Bulan Ini' : 'Monthly Financial Summary'}
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
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#111520]">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-[#10B981] flex-shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] block leading-tight font-medium">
                {language === 'id' ? 'Pemasukan' : 'Income'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-[#10B981]">
                +{formatCurrency(totalMonthIncome || 2500)}
              </span>
            </div>
          </div>

          {/* Total Pengeluaran */}
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#111520]">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-[#F43F5E] flex-shrink-0">
              <TrendingDown className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] block leading-tight font-medium">
                {language === 'id' ? 'Pengeluaran' : 'Expense'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#F43F5E]">
                -{formatCurrency(totalMonthExpense || 478)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Riwayat Kategori (Category Breakdown by Active Tab) */}
      <div className="flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'id'
              ? `Rincian Kategori ${activeType === 'expenses' ? 'Pengeluaran' : 'Pemasukan'}`
              : `${activeType === 'expenses' ? 'Expense' : 'Income'} Categories`}
          </h2>
          <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium">
            {displayedCategories.length} {language === 'id' ? 'Kategori' : 'Categories'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {displayedCategories.map((item) => {
            const pct =
              totalFilteredAmount > 0
                ? Math.round((item.amount / totalFilteredAmount) * 100)
                : 0;

            return (
              <div
                key={item.category}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] flex items-center justify-between shadow-xs hover:border-slate-300 dark:hover:border-[#2D364D] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${
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
                    <span className="text-[10px] text-slate-500 dark:text-[#7B88A6]">
                      {item.count} {language === 'id' ? 'transaksi' : 'tx'} • {pct}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold block ${
                      activeType === 'expenses'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-emerald-600 dark:text-[#10B981]'
                    }`}
                  >
                    {activeType === 'expenses' ? '-' : '+'}
                    {formatCurrency(item.amount)}
                  </span>
                  <div className="w-16 h-1 bg-slate-100 dark:bg-[#1E2435] rounded-full mt-1.5 ml-auto overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeType === 'expenses' ? 'bg-[#635BFF]' : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
