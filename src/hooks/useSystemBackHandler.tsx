'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BackHandlerFn = () => boolean;

// Priority-based stack of handlers (last registered runs first)
const handlerStack: BackHandlerFn[] = [];

/**
 * Register a custom back handler (e.g. for closing local modals or returning to a parent subview).
 * Return `true` if your handler handled the back action, or `false` to delegate down the stack.
 */
export const registerBackHandler = (handler: BackHandlerFn): (() => void) => {
  handlerStack.push(handler);
  return () => {
    const idx = handlerStack.lastIndexOf(handler);
    if (idx !== -1) {
      handlerStack.splice(idx, 1);
    }
  };
};

/**
 * Execute custom back handlers from newest to oldest.
 * Returns `true` if any handler consumed the event.
 */
export const executeBackAction = (): boolean => {
  for (let i = handlerStack.length - 1; i >= 0; i--) {
    const handler = handlerStack[i];
    if (handler && handler()) {
      return true;
    }
  }
  return false;
};

interface UseSystemBackHandlerProps {
  activeModal: string | null;
  closeModal: () => void;
  activeTab: string;
  goBackTab: () => boolean;
  language?: 'id' | 'en';
}

export function useSystemBackHandler({
  activeModal,
  closeModal,
  activeTab,
  goBackTab,
  language = 'id',
}: UseSystemBackHandlerProps) {
  const [showExitToast, setShowExitToast] = useState(false);

  // Keep fresh references to avoid recreating the popstate listener
  const activeModalRef = useRef(activeModal);
  const closeModalRef = useRef(closeModal);
  const activeTabRef = useRef(activeTab);
  const goBackTabRef = useRef(goBackTab);
  const lastBackPressRef = useRef<number>(0);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

  useEffect(() => {
    closeModalRef.current = closeModal;
  }, [closeModal]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    goBackTabRef.current = goBackTab;
  }, [goBackTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push initial history sentinel to capture system back button/gesture
    const pushSentinel = () => {
      window.history.pushState({ mypocket_app: true }, '', window.location.href);
    };

    // Ensure we start with a sentinel entry
    pushSentinel();

    const handlePopState = (event: PopStateEvent) => {
      // 1. Check custom handlers (e.g. subviews, internal modals in WalletView)
      if (executeBackAction()) {
        pushSentinel();
        return;
      }

      // 2. Check active root modal (e.g. AddTransactionModal, PocketDetailModal, etc.)
      if (activeModalRef.current !== null) {
        closeModalRef.current();
        pushSentinel();
        return;
      }

      // 3. Check tab navigation: if not on 'home', return to previous tab or 'home'
      if (activeTabRef.current !== 'home') {
        const navigated = goBackTabRef.current();
        if (navigated) {
          pushSentinel();
          return;
        }
      }

      // 4. On root 'home' tab with no modal open: Double-tap back to exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Double-tap confirmed: allow exiting the application / browser tab
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setShowExitToast(false);
        // Do NOT re-push sentinel; let the back navigation pop through to exit
        window.history.back();
      } else {
        // First back press on Home: show toast warning & restore sentinel
        lastBackPressRef.current = now;
        setShowExitToast(true);

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2000);

        pushSentinel();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return { showExitToast };
}

/**
 * Clean, modern floating toast informing the user to press back once more to exit.
 */
export const ExitConfirmToast: React.FC<{
  show: boolean;
  language?: 'id' | 'en';
}> = ({ show, language = 'id' }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="exit-toast"
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="fixed bottom-20 inset-x-0 mx-auto w-max max-w-[85vw] z-50 pointer-events-none"
        >
          <div className="bg-slate-900/90 dark:bg-[#1E2435]/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md border border-white/10 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] animate-pulse" />
            <span>
              {language === 'id'
                ? 'Tekan sekali lagi untuk keluar'
                : 'Press back again to exit'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
