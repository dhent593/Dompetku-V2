'use client';

import React from 'react';
import { Fingerprint, Lock, Delete, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const LockScreen: React.FC = () => {
  const {
    user,
    isLocked,
    pinInput,
    pinError,
    biometricLoading,
    pinLockoutRemaining,
    handleKeypadPress,
    handleKeypadBackspace,
    handleKeypadClear,
    unlockWithBiometrics,
    logout,
  } = useAuth();
  const { t, language } = useLanguage();

  const isDemo = user.email === 'smith@example.com';
  const hasPin = isDemo || Boolean(user.pinCreated === true && user.mPinHash && user.mPinHash.trim().length === 4);

  if (!isLocked || !hasPin) return null;
  const isLockedOut = pinLockoutRemaining > 0;
  const isBiometricActive = Boolean(user.biometricEnabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F5F9]/95 dark:bg-[#0A0D15]/95 backdrop-blur-md transition-colors duration-200">
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center text-slate-900 dark:text-white">
        {/* Brand Header */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-md shadow-[#635BFF]/25">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MyPocket</span>
        </div>

        <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium tracking-wide">
          {t('welcome_back')}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5 mb-5">
          {user.name || 'User'}
        </h2>

        {/* Solid Card */}
        <div className="w-full rounded-[24px] p-5 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15 mb-5">
          {isBiometricActive && (
            <>
              <button
                onClick={unlockWithBiometrics}
                disabled={biometricLoading || isLockedOut}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all mx-auto mb-2 cursor-pointer disabled:opacity-50"
                aria-label={t('unlock_fingerprint')}
              >
                {biometricLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-7 h-7 text-white stroke-[1.8]" />
                )}
              </button>
              <span className="text-xs font-semibold text-white block">{t('unlock_fingerprint')}</span>
              <span className="text-[10px] text-white/70 block my-1">{t('or')}</span>
            </>
          )}

          <span className="text-sm font-semibold text-white block">{t('enter_mpin')}</span>

          {/* 4 Digit Dots */}
          <div className="flex items-center justify-center space-x-3 mt-3">
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
            <p className="text-[11px] text-white mt-3 font-medium bg-black/30 py-1.5 px-3 rounded-full">
              {pinError}
            </p>
          )}

          {isLockedOut && (
            <p className="text-[11px] text-rose-200 mt-2 font-bold animate-pulse">
              {language === 'id'
                ? `Keypad terkunci (${pinLockoutRemaining} detik)`
                : `Keypad locked (${pinLockoutRemaining}s)`}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((val) => (
            <button
              key={val}
              disabled={isLockedOut}
              onClick={() => {
                if (val === 'C') handleKeypadClear();
                else if (val === '⌫') handleKeypadBackspace();
                else handleKeypadPress(val);
              }}
              className="h-11 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#141824] dark:hover:bg-[#1E2435] active:scale-95 text-slate-900 dark:text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {val === '⌫' ? <Delete className="w-5 h-5 text-slate-500 dark:text-[#8D9BB8]" /> : val}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full max-w-[270px] mt-3 px-2 text-xs text-slate-500 dark:text-[#7B88A6]">
          {isDemo ? (
            <span>Demo PIN: <strong className="text-slate-900 dark:text-white">1234</strong></span>
          ) : (
            <span>mPIN 4-digit</span>
          )}
          <button
            onClick={() => handleKeypadClear()}
            className="hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium"
          >
            {t('clear')}
          </button>
        </div>

        {/* Logout Fallback */}
        <div className="mt-4">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161B26]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Lupa PIN? Keluar Akun' : 'Forgot PIN? Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
