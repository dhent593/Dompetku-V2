'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, Sparkles, Delete } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LockScreen: React.FC = () => {
  const {
    user,
    isLocked,
    pinInput,
    pinError,
    biometricLoading,
    handleKeypadPress,
    handleKeypadBackspace,
    handleKeypadClear,
    unlockWithBiometrics,
  } = useAuth();

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D15]/95 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm flex flex-col items-center justify-center text-center text-white"
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#5B4DF9] to-[#9C38FE] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MyPocket</span>
        </div>

        <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Welcome back</span>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5 mb-6">{user.name}</h2>

        {/* Hero Card matching Screen 3 */}
        <div className="w-full rounded-[26px] p-6 text-white bg-gradient-to-br from-[#5950FA] via-[#7547FE] to-[#9C38FE] shadow-[0_16px_36px_-6px_rgba(118,71,254,0.42)] border border-white/10 mb-6">
          <button
            onClick={unlockWithBiometrics}
            disabled={biometricLoading}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all mx-auto mb-3"
            aria-label="Unlock with fingerprint"
          >
            {biometricLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Fingerprint className="w-9 h-9 text-white stroke-[1.8] group-hover:scale-105 transition-transform" />
            )}
            <span className="absolute inset-0 rounded-full animate-ping bg-white/15 pointer-events-none" />
          </button>

          <span className="text-sm font-semibold text-white block">Unlock with fingerprint</span>
          <span className="text-xs text-purple-200/70 block my-1">or</span>
          <span className="text-sm font-semibold text-white block">Enter 4 Digit Login mPIN</span>

          {/* 4 Digit Dots */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-110' : 'bg-white/40'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <motion.p
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-200 mt-3 font-medium bg-red-950/60 py-1 px-3 rounded-full"
            >
              {pinError}
            </motion.p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((val) => (
            <button
              key={val}
              onClick={() => {
                if (val === 'C') handleKeypadClear();
                else if (val === '⌫') handleKeypadBackspace();
                else handleKeypadPress(val);
              }}
              className="h-13 py-3 rounded-2xl bg-[#161B29] border border-[#20273D] hover:bg-[#20283E] active:scale-95 text-white font-bold text-lg flex items-center justify-center transition-all shadow-sm"
            >
              {val === '⌫' ? <Delete className="w-5 h-5 text-[#8D9BB8]" /> : val}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full max-w-[280px] mt-4 px-2 text-xs text-[#7B88A6]">
          <span>Demo PIN: <strong className="text-white">1234</strong></span>
          <button
            onClick={() => handleKeypadClear()}
            className="hover:text-white"
          >
            Clear
          </button>
        </div>
      </motion.div>
    </div>
  );
};
