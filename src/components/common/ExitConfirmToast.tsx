'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

export interface ExitConfirmToastProps {
  show: boolean;
  language?: 'id' | 'en';
}

export const ExitConfirmToast: React.FC<ExitConfirmToastProps> = ({
  show,
  language = 'id',
}) => {
  useEffect(() => {
    if (show && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch (_) {}
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="exit-confirm-toast"
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="fixed bottom-24 inset-x-0 mx-auto w-max max-w-[90vw] z-50 pointer-events-none select-none flex justify-center"
        >
          <div className="toast-capsule bg-[#0F172A]/95 dark:bg-[#161B26]/95 text-white text-[12.5px] font-semibold pl-3.5 pr-5 py-2.5 rounded-full shadow-[0_12px_32px_rgba(15,23,42,0.28)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/10 dark:border-white/10 flex items-center space-x-2.5 whitespace-nowrap transition-colors">
            {/* Glowing Accent Indicator */}
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-3 h-3 text-white stroke-[2.4]" />
            </div>

            <span className="text-white tracking-tight leading-none">
              {language === 'id'
                ? 'Tekan sekali lagi untuk keluar'
                : 'Press back again to exit'}
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] shadow-[0_0_6px_#635BFF] animate-pulse flex-shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
