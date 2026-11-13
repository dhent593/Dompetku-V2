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

  // Snappy, ultra-smooth page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 18 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1], // Ultra-responsive Apple/iOS native feel
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.12,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0D15] text-white flex flex-col justify-between selection:bg-[#635BFF] selection:text-white">
      {/* Main Direct Content Container with Snappy Slide-up Animation */}
      <main className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-start px-5 pt-6 pb-28 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
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
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#111520]/95 backdrop-blur-2xl border-t border-[#1C2233]">
        <div className="max-w-md mx-auto">
          <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />
          {/* Subtle mobile indicator bar */}
          <div className="w-full flex justify-center pb-2 bg-[#111520]/95">
            <div className="w-28 h-1 bg-white/20 rounded-full" />
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

      {/* Security Overlay / mPIN Lock Screen */}
      <LockScreen />
    </div>
  );
}
