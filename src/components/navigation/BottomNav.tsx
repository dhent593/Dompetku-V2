'use client';

import React from 'react';
import { Home, PieChart, Wallet, Settings, Plus } from 'lucide-react';
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
    { id: 'analytics', label: t('nav_analytics'), icon: PieChart },
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
        className="group relative flex flex-col items-center justify-center p-2 transition-transform active:scale-90 focus:outline-none cursor-pointer flex-1"
        aria-label={tab.label}
      >
        <div
          className={`transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-[#56627C] group-hover:text-[#8D9BB8]'
          }`}
        >
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Active Indicator Dot */}
        <div className="h-2 flex items-center justify-center mt-1">
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          )}
        </div>
      </button>
    );
  };

  return (
    <nav className="w-full bg-[#111520]/95 backdrop-blur-2xl border-t border-[#1C2233] px-4 py-2 z-30">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* Left Tabs (Home, Analytics) */}
        <div className="flex items-center justify-around flex-1">
          {leftTabs.map(renderTab)}
        </div>

        {/* Center Solid Floating (+) Button */}
        <div className="flex items-center justify-center px-2 relative -top-3.5">
          <button
            onClick={() => setActiveModal('recordActionSheet')}
            className="w-12 h-12 rounded-full bg-[#635BFF] hover:bg-[#564EE6] text-white flex items-center justify-center shadow-lg shadow-[#635BFF]/30 border-2 border-[#111520] active:scale-95 transition-all cursor-pointer"
            aria-label="Add Transaction"
            title={t('new_record')}
          >
            <Plus className="w-6 h-6 stroke-[2.4]" />
          </button>
        </div>

        {/* Right Tabs (Wallet, Settings) */}
        <div className="flex items-center justify-around flex-1">
          {rightTabs.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};
