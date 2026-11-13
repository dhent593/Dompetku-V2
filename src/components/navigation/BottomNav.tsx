'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, PieChart, Wallet, Settings } from 'lucide-react';
import { NavTab } from '@/types';
import { useFinance } from '@/context/FinanceContext';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#111522]/95 backdrop-blur-xl border-t border-[#1D253A] px-6 py-3 rounded-b-[40px] z-30">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="group relative flex flex-col items-center justify-center p-2 transition-transform active:scale-90 focus:outline-none"
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
        })}
      </div>
    </nav>
  );
};
