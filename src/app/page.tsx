'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemBackHandler, ExitConfirmToast } from '@/hooks/useSystemBackHandler';
import { LoginView } from '@/components/auth/LoginView';
import { HomeView } from '@/components/views/HomeView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { TransactionsView } from '@/components/views/TransactionsView';
import { BottomNav } from '@/components/navigation/BottomNav';
import { LockScreen } from '@/components/auth/LockScreen';
import { TransferModal } from '@/components/modals/TransferModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { ScanQRModal } from '@/components/modals/ScanQRModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { TransactionDetailModal } from '@/components/modals/TransactionDetailModal';
import { PaymentMethodsModal } from '@/components/modals/PaymentMethodsModal';
import { AccountSecurityModal } from '@/components/modals/AccountSecurityModal';
import { AddPocketModal } from '@/components/modals/AddPocketModal';
import { PocketDetailModal } from '@/components/modals/PocketDetailModal';
import { RecordActionSheet } from '@/components/modals/RecordActionSheet';
import { MovePocketFundsModal } from '@/components/modals/MovePocketFundsModal';
import { DebtManagementModal } from '@/components/modals/DebtManagementModal';
import { AssetManagementModal } from '@/components/modals/AssetManagementModal';
import { MonthlyBudgetModal } from '@/components/modals/MonthlyBudgetModal';
import { ResetDatabaseModal } from '@/components/modals/ResetDatabaseModal';

export default function App() {
  const { isLoggedIn } = useAuth();
  const { activeTab, setActiveTab, activeModal, setActiveModal, goBackTab } = useFinance();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // System back button & gesture navigation handler
  const { showExitToast } = useSystemBackHandler({
    activeModal,
    closeModal: () => setActiveModal(null),
    activeTab,
    goBackTab,
    language,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0D15] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not authenticated, render Login Screen with fast smooth bottom-up reveal
  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <LoginView />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Snappy, fluid page transition variants (zero-latency instant feel)
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.16,
        ease: [0.16, 1, 0.3, 1], // Ultra-responsive Apple/iOS native feel
      },
    },
    exit: {
      opacity: 0,
      pointerEvents: 'none' as const,
      transition: {
        duration: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0A0D15] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-[#635BFF] selection:text-white transition-colors duration-200">
      {/* Main Direct Content Container with Snappy Slide-up Animation */}
      <main
        className={`w-full max-w-md mx-auto flex flex-col justify-start px-5 pt-4 sm:pt-5 ${
          activeTab === 'home' || activeTab === 'transactions' || activeTab === 'analytics' || activeTab === 'wallet'
            ? 'h-[100dvh] pb-[66px] overflow-hidden'
            : 'min-h-screen pb-28 overflow-x-hidden'
        }`}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={
            activeTab === 'home' || activeTab === 'transactions' || activeTab === 'analytics' || activeTab === 'wallet'
              ? 'w-full h-full flex flex-col min-h-0'
              : 'w-full'
          }
        >
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'wallet' && <WalletView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'transactions' && <TransactionsView />}
        </motion.div>
      </main>

      {/* Direct Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#111520]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-[#1C2233] transition-colors duration-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md mx-auto pb-1">
          <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />
        </div>
      </div>

      {/* Fast, Snappy Gel Popups */}
      <TransferModal />
      <WithdrawModal />
      <ScanQRModal />
      <AddTransactionModal />
      <EditProfileModal />
      <TransactionDetailModal />
      <PaymentMethodsModal />
      <AccountSecurityModal />
      <AddPocketModal />
      <PocketDetailModal />
      <RecordActionSheet />
      <MovePocketFundsModal />
      <DebtManagementModal />
      <AssetManagementModal />
      <MonthlyBudgetModal />
      <ResetDatabaseModal />

      {/* Security Overlay / mPIN Lock Screen */}
      <LockScreen />

      {/* System Back Double-Tap Exit Toast */}
      <ExitConfirmToast show={showExitToast} language={language} />
    </div>
  );
}
