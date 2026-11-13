'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';

export const EditProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  if (activeModal !== 'editProfile') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setActiveModal(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#21293F]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B4DF9] to-[#9B45FE] flex items-center justify-center">
              <User className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <h3 className="text-base font-bold">Edit Profile</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Check className="w-12 h-12 text-[#10B981] mb-2" />
            <span className="text-sm font-bold text-white">Profile Updated!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1F263A] border border-[#2B3550] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5B4DF9]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#5B4DF9] to-[#9C38FE] text-white text-xs font-bold tracking-wide shadow-[0_6px_20px_rgba(118,71,254,0.35)] active:scale-95 transition-all mt-2"
            >
              Save Changes
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
