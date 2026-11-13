'use client';

import React, { useState } from 'react';
import { ChevronLeft, User, ChevronDown, Car, Landmark, Utensils, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { CHART_DATA } from '@/lib/dummyData';
import { TimeFilter, AnalyticType } from '@/types';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab, setActiveModal } = useFinance();
  const [activeType, setActiveType] = useState<AnalyticType>('expenses');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
  const [showDropdown, setShowDropdown] = useState(false);

  const currentChart = CHART_DATA[timeFilter];

  return (
    <div className="flex flex-col space-y-5 text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-[#161B26] border border-[#23293A] flex items-center justify-center text-white/90 hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-[#161B26] border border-[#23293A] flex items-center justify-center text-white/90 hover:bg-[#1E2433] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 2. Total Balance Card */}
      <div className="flex items-center justify-between p-5 rounded-[22px] bg-[#141824] border border-[#1E2435] shadow-sm">
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Total Balance</span>
          <div className="text-2xl sm:text-[26px] font-bold text-white tracking-tight mt-0.5">
            {formatCurrency(user.totalBalance)}
          </div>
        </div>

        <button
          onClick={() => setActiveModal('withdraw')}
          className="py-2.5 px-5 rounded-[14px] bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-semibold tracking-wide active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          Withdraw
        </button>
      </div>

      {/* 3. Expenses / Savings Tab Switcher */}
      <div className="flex items-center bg-[#111520] p-1.5 rounded-[18px] border border-[#1B2130]">
        <button
          onClick={() => setActiveType('expenses')}
          className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-semibold rounded-[14px] transition-all cursor-pointer ${
            activeType === 'expenses'
              ? 'text-white bg-[#1E2435] shadow-sm'
              : 'text-[#677491] hover:text-white'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveType('savings')}
          className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-semibold rounded-[14px] transition-all cursor-pointer ${
            activeType === 'savings'
              ? 'text-white bg-[#1E2435] shadow-sm'
              : 'text-[#677491] hover:text-white'
          }`}
        >
          Savings
        </button>
      </div>

      {/* 4. Month Header & Period Selector */}
      <div className="flex items-center justify-between pt-1 relative">
        <h2 className="text-base font-bold text-white tracking-tight">
          {timeFilter === 'monthly' ? 'March, 2023' : timeFilter === 'weekly' ? 'This Week' : 'Year 2023'}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-1.5 text-xs text-[#7A87A5] hover:text-white font-medium bg-[#141824] px-3 py-1.5 rounded-full border border-[#1E2435] transition-colors cursor-pointer"
          >
            <span className="capitalize">{timeFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1A2030] border border-[#273045] rounded-xl shadow-xl z-20 py-1 overflow-hidden">
              {(['monthly', 'weekly', 'yearly'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-white/90 hover:bg-[#232B3E] capitalize cursor-pointer"
                >
                  <span>{filter}</span>
                  {timeFilter === filter && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Clean, Professional Spline Chart (No Blurry Glow Filter) */}
      <div className="relative w-full h-[180px] flex flex-col justify-end pt-4">
        <div className="relative w-full h-[140px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 340 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#635BFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#635BFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Crisp clean reference grid lines */}
            <line x1="0" y1="35" x2="340" y2="35" stroke="#181E2E" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="85" x2="340" y2="85" stroke="#181E2E" strokeWidth="1" strokeDasharray="3 3" />

            {/* Subtle Clean Area Fill */}
            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100 L 340 140 L 0 140 Z'
                  : 'M 0 110 C 60 90, 120 70, 180 50 C 240 30, 290 20, 340 15 L 340 140 L 0 140 Z'
              }
              fill="url(#chartGradient)"
            />

            {/* Crisp Solid Line */}
            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100'
                  : 'M 0 110 C 60 90, 120 70, 180 50 C 240 30, 290 20, 340 15'
              }
              fill="none"
              stroke="#635BFF"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Solid Peak Point Indicator */}
            {activeType === 'expenses' && (
              <g>
                <circle cx="95" cy="25" r="5" fill="#635BFF" stroke="#FFFFFF" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Solid Tooltip Badge */}
          {activeType === 'expenses' && (
            <div className="absolute left-[28%] top-[-8px] -translate-x-1/2 bg-[#635BFF] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-sm flex items-center space-x-1 pointer-events-none">
              <span>$1,350</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#5D6B87] font-medium pt-3 px-1">
          {currentChart.labels.map((lbl, idx) => (
            <span
              key={lbl}
              className={`transition-colors ${
                idx === currentChart.highlightIndex ? 'text-white font-semibold' : ''
              }`}
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* 6. History Section */}
      <div className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">History</h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#7B88A6] hover:text-white transition-colors cursor-pointer font-medium"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-[20px] bg-[#141824] border border-[#1E2435] text-center hover:border-[#2D364D] transition-colors">
            <div className="w-11 h-11 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white">
              <Car className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs text-[#7B88A6] font-medium mt-3">Travel</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">$125.70</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-[20px] bg-[#141824] border border-[#1E2435] text-center hover:border-[#2D364D] transition-colors">
            <div className="w-11 h-11 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white">
              <Landmark className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs text-[#7B88A6] font-medium mt-3">Investment</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">$115.00</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-[20px] bg-[#141824] border border-[#1E2435] text-center hover:border-[#2D364D] transition-colors">
            <div className="w-11 h-11 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white">
              <Utensils className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs text-[#7B88A6] font-medium mt-3">Food</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">$156.75</span>
          </div>
        </div>
      </div>
    </div>
  );
};
