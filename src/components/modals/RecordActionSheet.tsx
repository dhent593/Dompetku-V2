'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyBottomSheetVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const RecordActionSheet: React.FC = () => {
  const { activeModal, setActiveModal } = useFinance();
  const { t } = useLanguage();

  const isOpen = activeModal === 'recordActionSheet';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="record-actionsheet-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 dark:bg-black/75 backdrop-blur-[2px]"
        >
          <motion.div
            key="record-actionsheet-container"
            variants={snappyBottomSheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#121622] rounded-t-[32px] px-6 pt-3 pb-8 shadow-2xl text-slate-900 dark:text-white relative transform-gpu will-change-transform"
          >
            {/* Top Drag Indicator */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-white/15 rounded-full mx-auto mb-4" />

            {/* Header: Clean & Minimalist */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#7B88A6] tracking-wide">
                {t('new_record')}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 pb-2">
              {/* 1. Pemasukan (Income) */}
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('addIncome')}
                className="flex flex-col items-center justify-center py-2 px-1 cursor-pointer group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-slate-200 dark:bg-white/[0.07] dark:group-hover:bg-white/[0.13] text-slate-700 group-hover:text-slate-900 dark:text-white/90 dark:group-hover:text-white flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-sm dark:shadow-none">
                  <ArrowDownLeft className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white mt-2.5 tracking-tight text-center transition-colors">
                  {t('record_income_title')}
                </span>
              </motion.button>

              {/* 2. Pengeluaran (Expense) */}
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('addExpense')}
                className="flex flex-col items-center justify-center py-2 px-1 cursor-pointer group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-slate-200 dark:bg-white/[0.07] dark:group-hover:bg-white/[0.13] text-slate-700 group-hover:text-slate-900 dark:text-white/90 dark:group-hover:text-white flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-sm dark:shadow-none">
                  <ArrowUpRight className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white mt-2.5 tracking-tight text-center transition-colors">
                  {t('record_expense_title')}
                </span>
              </motion.button>

              {/* 3. Pindah Dana (Transfer Funds) */}
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('movePocketFunds')}
                className="flex flex-col items-center justify-center py-2 px-1 cursor-pointer group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-slate-200 dark:bg-white/[0.07] dark:group-hover:bg-white/[0.13] text-slate-700 group-hover:text-slate-900 dark:text-white/90 dark:group-hover:text-white flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-sm dark:shadow-none">
                  <ArrowRightLeft className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white mt-2.5 tracking-tight text-center transition-colors">
                  {t('record_move_title')}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
