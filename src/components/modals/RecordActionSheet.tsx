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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="record-actionsheet-container"
            variants={snappyBottomSheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141824] border-t border-x border-[#1E2435] rounded-t-[28px] px-6 pt-3 pb-8 shadow-2xl text-white relative"
          >
            {/* Top Drag Indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />

            {/* Header: Simple & Clean */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2435]/60">
              <span className="text-xs font-semibold text-[#7B88A6] uppercase tracking-wider">
                {t('new_record')}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Simple Action Buttons: Icon on top, Label beneath */}
            <div className="grid grid-cols-3 gap-3 pt-5 pb-2">
              {/* 1. Pemasukan (Income) */}
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('addIncome')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1C2233]/60 hover:bg-[#1C2233] border border-[#273047]/60 hover:border-[#10B981]/60 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 group-hover:scale-105 group-hover:bg-[#10B981] group-hover:text-white transition-all shadow-sm">
                  <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-white/90 group-hover:text-white mt-2.5 tracking-tight text-center">
                  {t('record_income_title')}
                </span>
              </motion.button>

              {/* 2. Pengeluaran (Expense) */}
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('addExpense')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1C2233]/60 hover:bg-[#1C2233] border border-[#273047]/60 hover:border-[#F43F5E]/60 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F43F5E]/15 text-[#F43F5E] flex items-center justify-center border border-[#F43F5E]/30 group-hover:scale-105 group-hover:bg-[#F43F5E] group-hover:text-white transition-all shadow-sm">
                  <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-white/90 group-hover:text-white mt-2.5 tracking-tight text-center">
                  {t('record_expense_title')}
                </span>
              </motion.button>

              {/* 3. Pindah Dana (Transfer Funds) */}
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveModal('movePocketFunds')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1C2233]/60 hover:bg-[#1C2233] border border-[#273047]/60 hover:border-[#635BFF]/60 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/15 text-[#635BFF] flex items-center justify-center border border-[#635BFF]/30 group-hover:scale-105 group-hover:bg-[#635BFF] group-hover:text-white transition-all shadow-sm">
                  <ArrowRightLeft className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-white/90 group-hover:text-white mt-2.5 tracking-tight text-center">
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
