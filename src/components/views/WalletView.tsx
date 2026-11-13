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
  const { setActiveModal } = useFinance();
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeProductToast, setActiveProductToast] = useState<string | null>(null);

  const handleProductClick = (productName: string) => {
    if (productName === 'Scan QR') {
      setActiveModal('scanQr');
      return;
    }
    if (productName === 'Fund transfer') {
      setActiveModal('transfer');
      return;
    }

    setActiveProductToast(`${productName} module ready`);
    setTimeout(() => {
      setActiveProductToast(null);
    }, 2200);
  };

  const products = [
    { id: 'tap_to_pay', name: 'Tap to pay', icon: Wifi },
    { id: 'credit_cards', name: 'Credit cards', icon: CreditCard },
    { id: 'scan_qr', name: 'Scan QR', icon: QrCode },
    { id: 'mobile_banking', name: 'Mobile banking', icon: Smartphone },
    { id: 'loans', name: 'Loans', icon: Banknote },
    { id: 'fund_transfer', name: 'Fund transfer', icon: ArrowLeftRight },
  ];

  return (
    <div className="flex flex-col space-y-6 text-white w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs text-[#7B88A6] font-medium tracking-wide">Welcome back</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{user.name}</h1>
        </div>
      </div>

      {/* 2. Hero Security / mPIN Gradient Card */}
      <div className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-br from-[#5950FA] via-[#7547FE] to-[#9C38FE] shadow-[0_16px_36px_-6px_rgba(118,71,254,0.42)] border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center py-2">
          {/* Animated Fingerprint Button */}
          <button
            onClick={unlockWithBiometrics}
            disabled={biometricLoading}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all mb-3 focus:outline-none cursor-pointer"
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

          <span className="text-sm font-semibold text-white tracking-wide">Unlock with fingerprint</span>
          <span className="text-xs text-purple-200/70 font-normal my-1">or</span>
          <span className="text-sm font-semibold text-white tracking-wide">Enter 4 Digit Login mPIN</span>

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
                    isFilled ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-110' : 'bg-white/40'
                  }`}
                />
              );
            })}
          </button>

          {pinError && (
            <p className="text-[11px] text-red-200 mt-2 font-medium bg-red-900/40 py-1 px-3 rounded-full">
              {pinError}
            </p>
          )}
        </div>
      </div>

      {/* Sublinks below card */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-[#7B88A6]">
        <button
          onClick={() => setActiveModal('editProfile')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Not you?
        </button>
        <button
          onClick={() => setShowKeypad(true)}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Forgot PIN?
        </button>
      </div>

      {/* Interactive In-line Keypad when clicked */}
      {showKeypad && (
        <div className="bg-[#161B29] border border-[#20273D] rounded-[24px] p-4 flex flex-col items-center overflow-hidden">
          <div className="w-full flex justify-between items-center px-2 pb-3 border-b border-[#20273D]">
            <span className="text-xs text-[#7B88A6] font-medium">Numeric Keypad (Demo PIN: 1234)</span>
            <button
              onClick={() => setShowKeypad(false)}
              className="text-xs text-[#635BFF] font-semibold hover:underline cursor-pointer"
            >
              Hide
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
                className="h-12 rounded-xl bg-[#21283D] hover:bg-[#2C3550] active:scale-95 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Products Section */}
      <div className="flex flex-col space-y-3 pt-1">
        <h2 className="text-base font-bold text-white tracking-tight">Products</h2>

        <div className="grid grid-cols-3 gap-3">
          {products.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleProductClick(item.name)}
                className="flex flex-col items-center justify-center p-4 rounded-[22px] bg-[#161B29] border border-[#20273D] text-center hover:border-[#2D3856] active:scale-95 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[18px] bg-[#21283D] flex items-center justify-center text-white/90 group-hover:text-white shadow-inner transition-colors">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs text-[#7B88A6] font-medium mt-3 leading-tight group-hover:text-white transition-colors">
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#222A3F] border border-[#303B56] text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl flex items-center space-x-2 z-50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{activeProductToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
