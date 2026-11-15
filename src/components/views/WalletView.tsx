'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Fingerprint,
  Wifi,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';

export const WalletView: React.FC = () => {
  const {
    user,
    pinInput,
    pinError,
    biometricLoading,
    handleKeypadPress,
    handleKeypadBackspace,
    unlockWithBiometrics,
  } = useAuth();
  const { t } = useLanguage();
  const { setActiveModal } = useFinance();
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeProductToast, setActiveProductToast] = useState<string | null>(null);

  const handleProductClick = (productId: string, productName: string) => {
    if (productId === 'scan_qr') {
      setActiveModal('scanQr');
      return;
    }
    if (productId === 'fund_transfer') {
      setActiveModal('transfer');
      return;
    }

    setActiveProductToast(`${productName} module ready`);
    setTimeout(() => {
      setActiveProductToast(null);
    }, 2200);
  };

  const products = [
    { id: 'tap_to_pay' as const, name: t('tap_to_pay'), icon: Wifi },
    { id: 'credit_cards' as const, name: t('credit_cards'), icon: CreditCard },
    { id: 'scan_qr' as const, name: t('scan_qr'), icon: QrCode },
    { id: 'mobile_banking' as const, name: t('mobile_banking'), icon: Smartphone },
    { id: 'loans' as const, name: t('loans'), icon: Banknote },
    { id: 'fund_transfer' as const, name: t('fund_transfer'), icon: ArrowLeftRight },
  ];

  return (
    <div className="flex flex-col space-y-6 text-slate-900 dark:text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium tracking-wide">{t('welcome_back')}</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>
      </div>

      {/* 2. Hero Security / mPIN Solid Card (Clean, Minimalist, Matte Violet) */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15">
        <div className="flex flex-col items-center justify-center text-center py-2">
          {/* Fingerprint Button */}
          <button
            onClick={unlockWithBiometrics}
            disabled={biometricLoading}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all mb-3 focus:outline-none cursor-pointer"
            aria-label={t('unlock_fingerprint')}
          >
            {biometricLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint className="w-8 h-8 text-white stroke-[1.8]" />
            )}
          </button>

          <span className="text-sm font-semibold text-white tracking-wide">{t('unlock_fingerprint')}</span>
          <span className="text-xs text-white/75 font-normal my-1">{t('or')}</span>
          <span className="text-sm font-semibold text-white tracking-wide">{t('enter_mpin')}</span>

          {/* 4 Digit PIN Dots */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className="flex items-center space-x-3 mt-4 py-2 px-4 rounded-full bg-black/15 hover:bg-black/25 transition-all cursor-pointer"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    isFilled ? 'bg-white shadow-sm scale-110' : 'bg-white/40'
                  }`}
                />
              );
            })}
          </button>

          {pinError && (
            <p className="text-[11px] text-white mt-2 font-medium bg-black/30 py-1 px-3 rounded-full">
              {pinError}
            </p>
          )}
        </div>
      </div>

      {/* Sublinks below card */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500 dark:text-[#7B88A6]">
        <button
          onClick={() => setActiveModal('editProfile')}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {t('not_you')}
        </button>
        <button
          onClick={() => setShowKeypad(true)}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {t('forgot_pin')}
        </button>
      </div>

      {/* In-line Keypad */}
      {showKeypad && (
        <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] rounded-[22px] p-4 flex flex-col items-center shadow-sm">
          <div className="w-full flex justify-between items-center px-2 pb-3 border-b border-slate-200 dark:border-[#1E2435]">
            <span className="text-xs text-slate-500 dark:text-[#7B88A6] font-medium">{t('numeric_keypad')} (1234)</span>
            <button
              onClick={() => setShowKeypad(false)}
              className="text-xs text-[#635BFF] font-semibold hover:underline cursor-pointer"
            >
              {t('hide')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-3 max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === 'C' || k === '⌫') {
                    handleKeypadBackspace();
                  } else {
                    handleKeypadPress(k);
                  }
                }}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] active:scale-95 text-slate-900 dark:text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Products Section */}
      <div className="flex flex-col space-y-3 pt-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('products')}</h2>

        <div className="grid grid-cols-3 gap-3">
          {products.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleProductClick(item.id, item.name)}
                className="flex flex-col items-center justify-center p-4 rounded-[20px] bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#1E2435] text-center hover:border-slate-300 dark:hover:border-[#2D364D] hover:bg-slate-50 dark:hover:bg-[#181D2B] active:scale-95 transition-all group cursor-pointer shadow-sm"
              >
                <div className="w-12 h-12 rounded-[16px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs text-slate-600 dark:text-[#7B88A6] font-medium mt-3 leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {activeProductToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1C2233] border border-slate-700 dark:border-[#2B3550] text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center space-x-2 z-50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{activeProductToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
