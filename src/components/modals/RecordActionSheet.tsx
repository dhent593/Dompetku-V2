'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ChevronRight } from 'lucide-react';
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
            className="w-full max-w-md bg-[#141824] border-t border-x border-[#1E2435] rounded-t-[28px] p-5 pb-8 shadow-2xl text-white relative"
          >
            {/* Top Drag Indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3.5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1E2435]">
              <div>
                <h3 className="text-base font-bold tracking-tight text-white">
                  {t('record_action_title')}
                </h3>
                <p className="text-xs text-[#7B88A6] mt-0.5">
                  {t('record_action_subtitle')}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Action Options */}
            <div className="flex flex-col space-y-2.5 pt-4">
              {/* 1. Pemasukan (Income) */}
              <button
                type="button"
                onClick={() => setActiveModal('addIncome')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C2233] border border-[#273047] hover:border-[#10B981]/70 hover:bg-[#1E273A] active:scale-[0.98] transition-all cursor-pointer group shadow-sm text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                      <span>{t('record_income_title')}</span>
                      <span className="text-[10px] font-semibold text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded-md">
                        +
                      </span>
                    </h4>
                    <p className="text-xs text-[#7B88A6] mt-0.5 leading-snug">
                      {t('record_income_desc')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#7B88A6] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* 2. Pengeluaran (Expense) */}
              <button
                type="button"
                onClick={() => setActiveModal('addExpense')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C2233] border border-[#273047] hover:border-[#F43F5E]/70 hover:bg-[#1E273A] active:scale-[0.98] transition-all cursor-pointer group shadow-sm text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F43F5E]/15 text-[#F43F5E] flex items-center justify-center border border-[#F43F5E]/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                      <span>{t('record_expense_title')}</span>
                      <span className="text-[10px] font-semibold text-[#F43F5E] bg-[#F43F5E]/15 px-1.5 py-0.5 rounded-md">
                        -
                      </span>
                    </h4>
                    <p className="text-xs text-[#7B88A6] mt-0.5 leading-snug">
                      {t('record_expense_desc')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#7B88A6] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* 3. Pindah Dana (Move Funds Pocket A -> B) */}
              <button
                type="button"
                onClick={() => setActiveModal('movePocketFunds')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C2233] border border-[#273047] hover:border-[#635BFF]/70 hover:bg-[#1E273A] active:scale-[0.98] transition-all cursor-pointer group shadow-sm text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#635BFF]/15 text-[#635BFF] flex items-center justify-center border border-[#635BFF]/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowRightLeft className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                      <span>{t('record_move_title')}</span>
                      <span className="text-[10px] font-semibold text-[#635BFF] bg-[#635BFF]/15 px-1.5 py-0.5 rounded-md">
                        A ➔ B
                      </span>
                    </h4>
                    <p className="text-xs text-[#7B88A6] mt-0.5 leading-snug">
                      {t('record_move_desc')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#7B88A6] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
