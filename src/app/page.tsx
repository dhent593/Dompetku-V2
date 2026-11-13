'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceFrame } from '@/components/layout/DeviceFrame';
import { HomeView } from '@/components/views/HomeView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { WalletView } from '@/components/views/WalletView';
import { SettingsView } from '@/components/views/SettingsView';
import { TransactionsView } from '@/components/views/TransactionsView';
import { LockScreen } from '@/components/auth/LockScreen';
import { TransferModal } from '@/components/modals/TransferModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { ScanQRModal } from '@/components/modals/ScanQRModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { useFinance } from '@/context/FinanceContext';

export default function App() {
  const { activeTab } = useFinance();

  const tabVariants = {
    initial: { opacity: 0, scale: 0.98, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -6 },
  };

  return (
    <DeviceFrame>
      {/* Dynamic View Tab with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'wallet' && <WalletView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'transactions' && <TransactionsView />}
        </motion.div>
      </AnimatePresence>

      {/* Interactive Feature Modals */}
      <TransferModal />
      <WithdrawModal />
      <ScanQRModal />
      <AddTransactionModal />
      <EditProfileModal />

      {/* Security Overlay / mPIN Lock Screen */}
      <LockScreen />
    </DeviceFrame>
  );
}
