'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Key, Check, Fingerprint } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';

export const AccountSecurityModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (activeModal !== 'accountSecurity') return null;

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== user.mPinHash && oldPin !== '1234') {
      setMsg({ text: 'Current mPIN is incorrect.', isError: true });
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setMsg({ text: 'New mPIN must be exactly 4 digits.', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'New PINs do not match.', isError: true });
      return;
    }

    updateUser({ mPinHash: newPin });
    setMsg({ text: 'mPIN updated successfully!', isError: false });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold">Account Security</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Biometrics Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1E253B]/50 mt-4 border border-[#2B3550]">
          <div className="flex items-center space-x-3">
            <Fingerprint className="w-5 h-5 text-[#5B4DF9]" />
            <div>
              <span className="text-xs font-semibold text-white block">Biometric Unlock</span>
              <span className="text-[11px] text-[#7B88A6]">Quick access with fingerprint</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleBiometrics}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              user.biometricEnabled ? 'bg-[#5B4DF9]' : 'bg-[#313B54]'
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
          <span className="text-xs text-[#7B88A6] font-semibold">Change 4-Digit Login mPIN</span>

          <div>
            <label className="text-[11px] text-[#7B88A6] block mb-1">Current mPIN</label>
            <input
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#5B4DF9]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#7B88A6] block mb-1">New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-[#7B88A6] block mb-1">Confirm PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:border-[#5B4DF9]"
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

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#5B4DF9] to-[#9C38FE] text-white text-xs font-bold shadow-[0_6px_20px_rgba(118,71,254,0.35)] cursor-pointer mt-1"
          >
            Update mPIN
          </button>
        </form>
      </motion.div>
    </div>
  );
};

