'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Fingerprint, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AccountSecurityModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const { t, language } = useLanguage();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const isOpen = activeModal === 'accountSecurity';

  const isDemo = user.email === 'smith@example.com';
  // Strict check: non-demo users MUST have pinCreated === true to be considered having a PIN
  const hasPin = isDemo || Boolean(user.pinCreated === true && user.mPinHash && user.mPinHash.trim().length === 4);

  // If user does not have a PIN yet, force pinEnabled to false to prevent invalid lock
  useEffect(() => {
    if (!hasPin && user.pinEnabled) {
      updateUser({ pinEnabled: false });
    }
  }, [hasPin, user.pinEnabled]);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();

    // If user already had a PIN, verify old PIN
    if (hasPin) {
      const isOldPinCorrect = oldPin === user.mPinHash || (isDemo && oldPin === '1234');
      if (!isOldPinCorrect) {
        setMsg({
          text: language === 'id' ? 'mPIN saat ini salah.' : 'Current mPIN is incorrect.',
          isError: true,
        });
        return;
      }
    }

    // Validate new PIN format
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setMsg({
        text: language === 'id' ? 'PIN harus berupa 4 digit angka.' : 'PIN must be 4 digits.',
        isError: true,
      });
      return;
    }

    if (newPin !== confirmPin) {
      setMsg({
        text: language === 'id' ? 'Konfirmasi PIN baru tidak cocok.' : 'New PINs do not match.',
        isError: true,
      });
      return;
    }

    // Save PIN and explicitly mark as created
    updateUser({
      mPinHash: newPin,
      pinCreated: true,
      pinEnabled: true,
    });

    setMsg({
      text: !hasPin
        ? (language === 'id' ? 'mPIN berhasil dibuat & kunci aplikasi sekarang aktif!' : 'mPIN created & app lock enabled!')
        : (language === 'id' ? 'mPIN berhasil diperbarui!' : 'mPIN updated successfully!'),
      isError: false,
    });

    setTimeout(() => {
      setActiveModal(null);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setMsg(null);
    }, 1500);
  };

  const handleTogglePinLock = () => {
    if (!hasPin) {
      setMsg({
        text: language === 'id'
          ? 'Anda belum pernah membuat mPIN. Silakan buat 4-digit mPIN baru di bawah terlebih dahulu.'
          : 'You have not created an mPIN yet. Please create a new 4-digit mPIN below first.',
        isError: true,
      });
      return;
    }
    const next = !user.pinEnabled;
    updateUser({ pinEnabled: next });
    setMsg({
      text: next
        ? (language === 'id' ? 'Kunci aplikasi dengan mPIN diaktifkan.' : 'App lock with mPIN enabled.')
        : (language === 'id' ? 'Kunci aplikasi dinonaktifkan.' : 'App lock disabled.'),
      isError: false,
    });
  };

  const handleToggleBiometrics = () => {
    if (!hasPin) {
      setMsg({
        text: language === 'id'
          ? 'Anda belum pernah membuat mPIN. Silakan buat 4-digit mPIN terlebih dahulu.'
          : 'Please create a 4-digit mPIN first.',
        isError: true,
      });
      return;
    }
    const next = !user.biometricEnabled;
    updateUser({ biometricEnabled: next });
    setMsg({
      text: next
        ? (language === 'id' ? 'Buka kunci biometrik diaktifkan.' : 'Biometric unlock enabled.')
        : (language === 'id' ? 'Buka kunci biometrik dinonaktifkan.' : 'Biometric unlock disabled.'),
      isError: false,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="security-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-[2px]"
        >
          <motion.div
            key="security-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white relative transform-gpu will-change-transform max-h-[90vh] overflow-y-auto scrollbar-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm text-white">
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {t('account_security')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                    {language === 'id' ? 'Proteksi akun & kunci aplikasi' : 'Account protection & app lock'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification message */}
            {msg && (
              <div
                className={`text-xs p-2.5 rounded-xl border mt-3 transition-all ${
                  msg.isError
                    ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/50'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/50'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* Security Toggles Section */}
            <div className="space-y-2.5 mt-3.5">
              {/* App Lock with PIN Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#1C2233]/60 border border-slate-100 dark:border-transparent">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#635BFF]/10 dark:bg-[#635BFF]/20 flex items-center justify-center text-[#635BFF]">
                    <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      {language === 'id' ? 'Kunci dengan mPIN' : 'App Lock with mPIN'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#7B88A6]">
                      {language === 'id' ? 'Minta PIN saat buka aplikasi' : 'Require PIN when opening app'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePinLock}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    hasPin && user.pinEnabled ? 'bg-[#635BFF]' : 'bg-slate-300 dark:bg-[#313B54]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                      hasPin && user.pinEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Biometrics Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#1C2233]/60 border border-slate-100 dark:border-transparent">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#635BFF]/10 dark:bg-[#635BFF]/20 flex items-center justify-center text-[#635BFF]">
                    <Fingerprint className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">{t('biometric_unlock')}</span>
                    <span className="text-[10px] text-slate-500 dark:text-[#7B88A6]">{t('biometric_desc')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBiometrics}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    hasPin && user.biometricEnabled ? 'bg-[#635BFF]' : 'bg-slate-300 dark:bg-[#313B54]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                      hasPin && user.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* PIN Setup or Change Form */}
            <form onSubmit={handleSavePin} className="flex flex-col space-y-3 pt-4 border-t border-slate-100 dark:border-[#1E2435] mt-3.5">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5 text-[#635BFF]" />
                <span className="text-xs text-slate-800 dark:text-white font-bold">
                  {!hasPin
                    ? (language === 'id' ? 'Buat 4-Digit mPIN Baru' : 'Create 4-Digit mPIN')
                    : t('change_mpin')}
                </span>
              </div>

              {!hasPin ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <p className="leading-relaxed">
                    {language === 'id'
                      ? 'Akun Anda belum pernah membuat mPIN. Buat 4-digit mPIN di bawah terlebih dahulu untuk mengaktifkan fitur kunci aplikasi.'
                      : 'Your account does not have an mPIN yet. Create a 4-digit mPIN below first to enable app lock.'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] block mb-1 font-medium">{t('current_mpin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] block mb-1 font-medium">
                    {!hasPin ? (language === 'id' ? 'mPIN Baru' : 'New PIN') : t('new_mpin')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-700 dark:text-[#7B88A6] block mb-1 font-medium">{t('confirm_mpin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer mt-1 shadow-sm active:scale-95"
              >
                {!hasPin
                  ? (language === 'id' ? 'Buat & Aktifkan mPIN' : 'Create & Enable mPIN')
                  : t('update_mpin_btn')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
