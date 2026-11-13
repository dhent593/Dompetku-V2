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
          className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-[#181E2E] border border-[#242E46] flex items-center justify-center text-white/90 hover:bg-[#20283E] active:scale-95 transition-all shadow-sm overflow-hidden cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 2. Total Balance Card */}
      <div className="flex items-center justify-between p-5 rounded-[24px] bg-[#161B29] border border-[#20273D] shadow-sm">
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Total Balance</span>
          <div className="text-2xl sm:text-[26px] font-bold text-white tracking-tight mt-0.5">
            {formatCurrency(user.totalBalance)}
          </div>
        </div>

        <button
          onClick={() => setActiveModal('withdraw')}
          className="py-2.5 px-5 rounded-[16px] bg-gradient-to-r from-[#5E51FA] to-[#9338FE] text-white text-xs font-semibold tracking-wide hover:opacity-95 active:scale-95 transition-all shadow-[0_6px_20px_rgba(118,71,254,0.35)] cursor-pointer"
        >
          Withdraw
        </button>
      </div>

      {/* 3. Expenses / Savings Tab Switcher */}
      <div className="flex items-center bg-[#131724] p-1.5 rounded-[20px] border border-[#1E253A]">
        <button
          onClick={() => setActiveType('expenses')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold rounded-[16px] transition-all cursor-pointer ${
            activeType === 'expenses'
              ? 'text-white bg-[#222A3F] shadow-sm'
              : 'text-[#677491] hover:text-white'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveType('savings')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold rounded-[16px] transition-all cursor-pointer ${
            activeType === 'savings'
              ? 'text-white bg-[#222A3F] shadow-sm'
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
            className="flex items-center space-x-1.5 text-xs text-[#7A87A5] hover:text-white font-medium bg-[#161B29] px-3 py-1.5 rounded-full border border-[#20273D] transition-colors cursor-pointer"
          >
            <span className="capitalize">{timeFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1B2234] border border-[#29344E] rounded-xl shadow-xl z-20 py-1 overflow-hidden">
              {(['monthly', 'weekly', 'yearly'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTimeFilter(filter);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-white/90 hover:bg-[#252E47] capitalize cursor-pointer"
                >
                  <span>{filter}</span>
                  {timeFilter === filter && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Custom Spline Wave Graph matching Screenshot */}
      <div className="relative w-full h-[180px] flex flex-col justify-end pt-4">
        <div className="relative w-full h-[140px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 340 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6452FA" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#6452FA" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#6452FA" stopOpacity="0" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <line x1="0" y1="35" x2="340" y2="35" stroke="#1D2437" strokeWidth="1" />
            <line x1="0" y1="85" x2="340" y2="85" stroke="#1D2437" strokeWidth="1" />

            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100 L 340 140 L 0 140 Z'
                  : 'M 0 110 C 60 90, 120 70, 180 50 C 240 30, 290 20, 340 15 L 340 140 L 0 140 Z'
              }
              fill="url(#chartGradient)"
            />

            <path
              d={
                activeType === 'expenses'
                  ? 'M 0 100 C 40 95, 70 25, 95 25 C 130 25, 145 95, 180 95 C 220 95, 250 65, 290 65 C 320 65, 335 100, 340 100'
                  : 'M 0 110 C 60 90, 120 70, 180 50 C 240 30, 290 20, 340 15'
              }
              fill="none"
              stroke="#6854FA"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {activeType === 'expenses' && (
              <g>
                <circle cx="95" cy="25" r="5" fill="#6854FA" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="95" cy="25" r="10" fill="none" stroke="#6854FA" strokeOpacity="0.4" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Floating Tooltip Pill Badge */}
          {activeType === 'expenses' && (
            <div className="absolute left-[28%] top-[-8px] -translate-x-1/2 bg-[#5B4DF9] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-lg flex items-center space-x-1 pointer-events-none">
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
            className="text-xs text-[#6A7898] hover:text-white transition-colors cursor-pointer font-medium"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-[22px] bg-[#161B29] border border-[#20273D] text-center hover:border-[#2D3856] transition-colors">
            <div className="w-11 h-11 rounded-[16px] bg-[#21283D] flex items-center justify-center text-white/90 shadow-inner">
              <Car className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs text-[#7B88A6] font-medium mt-3">Travel</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">$125.70</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-[22px] bg-[#161B29] border border-[#20273D] text-center hover:border-[#2D3856] transition-colors">
            <div className="w-11 h-11 rounded-[16px] bg-[#21283D] flex items-center justify-center text-white/90 shadow-inner">
              <Landmark className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-xs text-[#7B88A6] font-medium mt-3">Investment</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5">$115.00</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-[22px] bg-[#161B29] border border-[#20273D] text-center hover:border-[#2D3856] transition-colors">
            <div className="w-11 h-11 rounded-[16px] bg-[#21283D] flex items-center justify-center text-white/90 shadow-inner">
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
