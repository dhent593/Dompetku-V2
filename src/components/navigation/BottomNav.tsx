'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Wallet, Settings, Plus } from 'lucide-react';
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
    { id: 'transactions', label: t('transactions'), icon: Search },
  ];

  const rightTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'wallet', label: t('nav_wallet'), icon: Wallet },
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
            isActive ? 'text-white' : 'text-[#56627C] group-hover:text-[#8D9BB8]'
          }`}
        >
          <Icon
            className={`w-6 h-6 transition-all duration-200 ${
              tab.id === 'home' && isActive
                ? 'fill-white stroke-white'
                : 'stroke-[2]'
            }`}
          />
        </div>

        {/* Active Indicator Dot directly underneath icon */}
        <div className="h-1.5 flex items-center justify-center mt-1">
          {isActive ? (
            <motion.div
              layoutId="activeNavDot"
              className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
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
            className="w-[58px] h-[58px] rounded-full bg-[#1C2538] hover:bg-[#232F46] border border-white/10 text-white flex items-center justify-center shadow-[0_14px_30px_rgba(0,0,0,0.65),0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer transition-all"
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
