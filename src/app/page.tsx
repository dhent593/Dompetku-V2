'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
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

export default function App() {
  const { isLoggedIn } = useAuth();
  const { activeTab, setActiveTab } = useFinance();

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
      transition: {
        duration: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-[#635BFF] selection:text-white transition-colors duration-200">
      {/* Main Direct Content Container with Snappy Slide-up Animation */}
      <main
        className={`w-full max-w-md mx-auto flex flex-col justify-start px-5 pt-4 sm:pt-5 ${
          activeTab === 'home' || activeTab === 'transactions'
            ? 'h-[100dvh] pb-[66px] overflow-hidden'
            : 'min-h-screen pb-28 overflow-x-hidden'
        }`}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={
              activeTab === 'home' || activeTab === 'transactions'
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
        </AnimatePresence>
      </main>

      {/* Direct Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#111520]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-[#1C2233] transition-colors duration-200">
        <div className="max-w-md mx-auto">
          <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />
          {/* Subtle mobile indicator bar */}
          <div className="w-full flex justify-center pb-2 bg-transparent">
            <div className="w-28 h-1 bg-slate-300 dark:bg-white/20 rounded-full transition-colors" />
          </div>
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

      {/* Security Overlay / mPIN Lock Screen */}
      <LockScreen />
    </div>
  );
}
