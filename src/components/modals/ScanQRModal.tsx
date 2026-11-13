'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, CheckCircle2, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

export const ScanQRModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction } = useFinance();
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  if (activeModal !== 'scanQr') return null;

  const handleSimulateScan = () => {
    // Simulate detecting a merchant QR code
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm rounded-[28px] bg-[#161B29] border border-[#232C42] p-6 shadow-2xl text-white relative flex flex-col items-center"
      >
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#20273D] flex items-center justify-center text-[#7B88A6] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Scan QR Code</h3>
        <p className="text-xs text-[#7B88A6] mb-6">Align the QR code within the viewfinder frame</p>

        {/* Viewfinder Frame */}
        <div className="relative w-56 h-56 rounded-3xl border-2 border-dashed border-[#5B4DF9]/70 bg-black/40 flex items-center justify-center overflow-hidden">
          {/* Laser scanning line */}
          <motion.div
            animate={{ y: [-100, 100, -100] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#9B45FE] to-transparent shadow-[0_0_12px_#9B45FE]"
          />

          <QrCode className="w-24 h-24 text-white/20 stroke-[1]" />

          {/* Corner highlights */}
          <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#5B4DF9] rounded-tl" />
          <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#5B4DF9] rounded-tr" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#5B4DF9] rounded-bl" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#5B4DF9] rounded-br" />
        </div>

        {scannedResult ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-xs font-semibold text-[#10B981] bg-[#10B981]/15 py-2 px-4 rounded-full mt-5 border border-[#10B981]/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{scannedResult}</span>
          </motion.div>
        ) : (
          <button
            onClick={handleSimulateScan}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#21283D] border border-[#2B3550] hover:border-[#5B4DF9] text-xs font-semibold text-white mt-6 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5B4DF9]" />
            <span>Simulate Scan Payment ($8.50)</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
