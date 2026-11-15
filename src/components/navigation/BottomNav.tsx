'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wallet, PieChart, Settings, Plus } from 'lucide-react';
import { NavTab } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { setActiveModal } = useFinance();
  const { t } = useLanguage();

  const leftTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t('nav_home'), icon: Home },
    { id: 'wallet', label: t('nav_wallet'), icon: Wallet },
  ];

  const rightTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'analytics', label: t('nav_analytics'), icon: PieChart },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
  ];

  const renderTab = (tab: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = tab.icon;
    const isActive = currentTab === tab.id;

    return (
      <button
        key={tab.id}
        onClick={() => onSelectTab(tab.id)}
        className="group relative flex flex-col items-center justify-center py-2 px-3 transition-transform active:scale-90 focus:outline-none cursor-pointer flex-1"
        aria-label={tab.label}
        title={tab.label}
      >
        <div
          className={`transition-colors duration-200 ${
            isActive
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 group-hover:text-slate-600 dark:text-[#56627C] dark:group-hover:text-[#8D9BB8]'
          }`}
        >
          <Icon
            className={`w-6 h-6 transition-all duration-200 ${
              isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'
            }`}
          />
        </div>

        {/* Active Indicator Dot directly underneath icon */}
        <div className="h-1.5 flex items-center justify-center mt-1">
          {isActive ? (
            <motion.div
              layoutId="activeNavDot"
              className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shadow-sm"
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            />
          ) : (
            <div className="w-1.5 h-1.5" />
          )}
        </div>
      </button>
    );
  };

  return (
    <nav className="w-full px-4 pt-1 pb-0 relative">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* Left Tabs (Home, Search) */}
        <div className="flex items-center justify-around flex-1">
          {leftTabs.map(renderTab)}
        </div>

        {/* Center Floating (+) Button */}
        <div className="flex items-center justify-center px-2 relative -top-7 z-20">
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveModal('recordActionSheet')}
            className="w-[58px] h-[58px] rounded-full bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#1C2538] dark:hover:bg-[#232F46] border border-slate-200/60 dark:border-white/10 text-white flex items-center justify-center shadow-[0_12px_28px_rgba(15,23,42,0.22),0_4px_10px_rgba(15,23,42,0.12)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.65),0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer transition-all"
            aria-label="Add Transaction"
            title={t('new_record')}
          >
            <Plus className="w-7 h-7 stroke-[2.4]" />
          </motion.button>
        </div>

        {/* Right Tabs (Wallet, Settings) */}
        <div className="flex items-center justify-around flex-1">
          {rightTabs.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};
