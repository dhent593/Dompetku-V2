'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';

export const EditProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const isOpen = activeModal === 'editProfile';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setActiveModal(null);
    }, 1200);
  };

  const gelVariants = {
    initial: { opacity: 0, scale: 0.72, y: 35 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 22,
        mass: 0.75,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.18, ease: 'easeIn' },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="editprofile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="editprofile-modal"
            variants={gelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center">
                  <User className="w-4 h-4 text-white stroke-[2]" />
                </div>
                <h3 className="text-base font-bold">Edit Profile</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saved ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <Check className="w-12 h-12 text-[#10B981] mb-2" />
                <span className="text-sm font-bold text-white">Profile Updated!</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-[#7B88A6] font-medium block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
                >
                  Save Changes
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
