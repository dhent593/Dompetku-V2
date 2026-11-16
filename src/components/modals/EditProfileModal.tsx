'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const EditProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { activeModal, setActiveModal } = useFinance();
  const { t } = useLanguage();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="editprofile-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="editprofile-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative"
          >
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('edit_profile')}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
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
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('profile_updated')}</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('display_name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {t('email_label')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
                >
                  {t('save_changes')}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
