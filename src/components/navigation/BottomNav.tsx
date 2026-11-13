'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, PieChart, Wallet, Settings, Plus } from 'lucide-react';
import { NavTab } from '@/types';
import { useFinance } from '@/context/FinanceContext';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { setActiveModal } = useFinance();

  const leftTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
  ];

  const rightTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Active Indicator Dot */}
        <div className="h-2 flex items-center justify-center mt-1">
          {isActive && (
            <motion.div
              layoutId="activeNavDot"
              className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </div>
      </button>
    );
  };

  return (
    <nav className="w-full bg-[#111522]/95 backdrop-blur-2xl border-t border-[#1D253A] px-4 py-2 z-30">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* Left Tabs (Home, Analytics) */}
        <div className="flex items-center justify-around flex-1">
          {leftTabs.map(renderTab)}
        </div>

        {/* Center Floating (+) Button */}
        <div className="flex items-center justify-center px-2 relative -top-3.5">
          <button
            onClick={() => setActiveModal('addTx')}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#5950FA] via-[#7547FE] to-[#9C38FE] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(118,71,254,0.5)] border-2 border-[#111522] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            aria-label="Add Transaction"
            title="Add Transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.6] group-hover:rotate-90 transition-transform duration-200" />
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
