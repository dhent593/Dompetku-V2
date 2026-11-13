'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CheckCircle2, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const ScanQRModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction } = useFinance();
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const isOpen = activeModal === 'scanQr';

  const handleSimulateScan = () => {
    const merchantName = 'Starbucks Coffee - Downtown';
    const amount = 8.50;

    addTransaction({
      title: merchantName,
      category: 'food',
      amount: amount,
      type: 'expense',
      note: 'QR contactless merchant payment',
    });

    setScannedResult(`Paid ${formatCurrency(amount)} to ${merchantName}`);
    setTimeout(() => {
      setScannedResult(null);
      setActiveModal(null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="scanqr-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            key="scanqr-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative flex flex-col items-center"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Scan QR Code</h3>
            <p className="text-xs text-[#7B88A6] mb-6">Align the QR code within the viewfinder frame</p>

            {/* Viewfinder Frame */}
            <div className="relative w-56 h-56 rounded-2xl border-2 border-dashed border-[#635BFF]/70 bg-black/40 flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{ y: [-100, 100, -100] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="absolute w-full h-0.5 bg-[#635BFF] shadow-[0_0_8px_#635BFF]"
              />

              <QrCode className="w-24 h-24 text-white/20 stroke-[1]" />

              <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#635BFF] rounded-tl" />
              <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#635BFF] rounded-tr" />
              <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#635BFF] rounded-bl" />
              <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#635BFF] rounded-br" />
            </div>

            {scannedResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-xs font-semibold text-[#10B981] bg-[#10B981]/15 py-2 px-4 rounded-full mt-5 border border-[#10B981]/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{scannedResult}</span>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSimulateScan}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#1C2233] border border-[#273047] hover:border-[#635BFF] text-xs font-semibold text-white mt-6 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>Simulate Scan Payment ($8.50)</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
