'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, RotateCcw, ShieldCheck } from 'lucide-react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { activeTab, setActiveTab, resetData } = useFinance();
  const { lockApp } = useAuth();
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');

  // Real-time simulated status bar clock
  const [timeStr, setTimeStr] = React.useState('9:41');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-start md:justify-center p-0 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-[#5B4DF9] selection:text-white">
      {/* Desktop Top Control Floating Bar (Visible on larger screens) */}
      <header className="hidden md:flex items-center justify-between w-full max-w-4xl mb-4 px-4 py-2.5 rounded-2xl bg-[#111522]/90 border border-[#1D253A] backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#5B4DF9] to-[#9C38FE] flex items-center justify-center font-bold text-white text-[11px]">
            MP
          </div>
          <span className="font-bold text-white text-sm">MyPocket</span>
          <span className="text-[#64728E] hidden sm:inline">| Personal Finance Studio</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#181E2E] p-1 rounded-xl border border-[#232C42]">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#5B4DF9] text-white shadow-sm'
                  : 'text-[#7B88A6] hover:text-white'
              }`}
              title="Mobile Device Mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>

            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'responsive'
                  ? 'bg-[#5B4DF9] text-white shadow-sm'
                  : 'text-[#7B88A6] hover:text-white'
              }`}
              title="Fluid Tablet/Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Wide View</span>
            </button>
          </div>

          {/* Quick Lock / Reset demo data */}
          <button
            onClick={lockApp}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#181E2E] border border-[#232C42] text-[#7B88A6] hover:text-white hover:border-[#5B4DF9] transition-all"
            title="Lock screen with mPIN"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#5B4DF9]" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          <button
            onClick={resetData}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#181E2E] border border-[#232C42] text-[#7B88A6] hover:text-white hover:border-red-500/50 transition-all"
            title="Reset to default reference data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Main Container: Mobile Frame vs Wide Container */}
      <main
        className={`relative w-full transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-[400px] h-screen md:h-[844px] md:rounded-[44px] md:border-[10px] md:border-[#1E253A] md:shadow-[0_25px_70px_rgba(0,0,0,0.8)]'
            : 'max-w-2xl h-screen md:h-[844px] md:rounded-[36px] md:border-2 md:border-[#1E253A] md:shadow-2xl'
        } bg-[#0A0D15] flex flex-col justify-between overflow-hidden`}
      >
        {/* Top Status Bar (in mobile view) */}
        <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between text-xs text-[#7B88A6] select-none z-20 flex-shrink-0">
          <span className="font-semibold text-white tracking-tight text-[13px]">{timeStr}</span>

          {/* Dynamic Island / Speaker cutout simulation for phone frame */}
          {viewMode === 'mobile' && (
            <div className="hidden md:block w-24 h-4 bg-black rounded-full shadow-inner" />
          )}

          <div className="flex items-center space-x-1.5 text-white/80">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3C7.5 3 3.7 4.9 1 8l11 13 11-13c-2.7-3.1-6.5-5-11-5z" />
            </svg>
            <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Scrollable View Content Area */}
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-24 scrollbar-none">
          {children}
        </div>

        {/* Bottom Navigation Dock */}
        <div className="absolute bottom-0 inset-x-0 z-30">
          <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />
          {/* iOS Bottom Indicator Bar */}
          <div className="w-full flex justify-center pb-2 bg-[#111522]/95">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};
