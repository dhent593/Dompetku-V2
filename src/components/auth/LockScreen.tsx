'use client';

import React from 'react';
import { Fingerprint, Lock, Delete } from 'lucide-react';
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
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center text-white">
        {/* Brand Header */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-md shadow-[#635BFF]/25">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MyPocket</span>
        </div>

        <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Welcome back</span>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5 mb-6">{user.name}</h2>

        {/* Solid Card */}
        <div className="w-full rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15 mb-6">
          <button
            onClick={unlockWithBiometrics}
            disabled={biometricLoading}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all mx-auto mb-3 cursor-pointer"
            aria-label="Unlock with fingerprint"
          >
            {biometricLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint className="w-8 h-8 text-white stroke-[1.8]" />
            )}
          </button>

          <span className="text-sm font-semibold text-white block">Unlock with fingerprint</span>
          <span className="text-xs text-white/70 block my-1">or</span>
          <span className="text-sm font-semibold text-white block">Enter 4 Digit Login mPIN</span>

          {/* 4 Digit Dots */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled ? 'bg-white shadow-sm scale-110' : 'bg-white/40'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-[11px] text-white mt-3 font-medium bg-black/30 py-1 px-3 rounded-full">
              {pinError}
            </p>
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
              className="h-12 rounded-xl bg-[#141824] border border-[#1E2435] hover:bg-[#1E2435] active:scale-95 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              {val === '⌫' ? <Delete className="w-5 h-5 text-[#8D9BB8]" /> : val}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full max-w-[280px] mt-4 px-2 text-xs text-[#7B88A6]">
          <span>Demo PIN: <strong className="text-white">1234</strong></span>
          <button
            onClick={() => handleKeypadClear()}
            className="hover:text-white cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
