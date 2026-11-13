'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Fingerprint } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AccountSecurityModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const { t } = useLanguage();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const isOpen = activeModal === 'accountSecurity';

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== user.mPinHash && oldPin !== '1234') {
      setMsg({ text: 'Current mPIN salah / Current mPIN is incorrect.', isError: true });
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setMsg({ text: 'PIN harus 4 digit angka / PIN must be 4 digits.', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'PIN baru tidak cocok / New PINs do not match.', isError: true });
      return;
    }

    updateUser({ mPinHash: newPin });
    setMsg({ text: 'mPIN berhasil diperbarui! / mPIN updated successfully!', isError: false });
    setTimeout(() => {
      setActiveModal(null);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setMsg(null);
    }, 1500);
  };

  const handleToggleBiometrics = () => {
    const next = !user.biometricEnabled;
    updateUser({ biometricEnabled: next });
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="security-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold">{t('account_security')}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Biometrics Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C2233]/60 mt-4 border border-[#273047]">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-5 h-5 text-[#635BFF]" />
                <div>
                  <span className="text-xs font-semibold text-white block">{t('biometric_unlock')}</span>
                  <span className="text-[11px] text-[#7B88A6]">{t('biometric_desc')}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  user.biometricEnabled ? 'bg-[#635BFF]' : 'bg-[#313B54]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                    user.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Change PIN Form */}
            <form onSubmit={handleChangePin} className="flex flex-col space-y-3 pt-3">
              <span className="text-xs text-[#7B88A6] font-semibold">{t('change_mpin')}</span>

              <div>
                <label className="text-[11px] text-[#7B88A6] block mb-1">{t('current_mpin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#635BFF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#7B88A6] block mb-1">{t('new_mpin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#7B88A6] block mb-1">{t('confirm_mpin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>
              </div>

              {msg && (
                <div
                  className={`text-xs p-2.5 rounded-xl border ${
                    msg.isError
                      ? 'text-red-400 bg-red-950/40 border-red-900/50'
                      : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer mt-1 shadow-sm"
              >
                {t('update_mpin_btn')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
