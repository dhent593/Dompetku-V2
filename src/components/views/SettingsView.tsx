'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Pencil,
  Shield,
  Moon,
  Headphones,
  ChevronRight,
  LogOut,
  Check,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { setActiveModal } = useFinance();
  const { language, setLanguage, t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    showToast(isDarkMode ? 'Preview: Ambient Mode' : 'Deep Dark Mode');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="flex flex-col space-y-5 text-white w-full">
      {/* 1. Top Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('settings_title')}</h1>
      </div>

      {/* 2. User Profile Card */}
      <div className="flex items-center justify-between p-4 rounded-[22px] bg-[#141824] border border-[#1E2435]">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#1C2233] border border-[#273047] flex items-center justify-center text-white/90 overflow-hidden shadow-inner">
              <User className="w-7 h-7 stroke-[1.8]" />
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#141824] absolute bottom-0 right-0 shadow-sm" />
          </div>

          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{user.name} Doe</h2>
            <p className="text-xs text-[#7B88A6] mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('editProfile')}
          className="w-9 h-9 rounded-full bg-[#1C2233] hover:bg-[#252E44] flex items-center justify-center text-white/90 active:scale-90 transition-all border border-[#273047] cursor-pointer"
          aria-label="Edit Profile"
        >
          <Pencil className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* 3. Settings List */}
      <div className="flex flex-col space-y-3 pt-1">
        {/* Language Switcher Setting */}
        <div className="flex items-center justify-between p-4 rounded-[20px] bg-[#141824] border border-[#1E2435]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white/90">
              <Globe className="w-5 h-5 stroke-[2] text-[#635BFF]" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white tracking-tight block">
                {t('language_setting')}
              </span>
              <span className="text-[11px] text-[#7B88A6]">
                {language === 'id' ? 'Bahasa Indonesia aktif' : 'English active'}
              </span>
            </div>
          </div>

          {/* Clean Segmented Language Pill */}
          <div className="flex bg-[#111520] p-1 rounded-xl border border-[#1C2233]">
            <button
              onClick={() => {
                setLanguage('id');
                showToast('Bahasa diubah ke Indonesia');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'id'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-[#7B88A6] hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                showToast('Language changed to English');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-[#7B88A6] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Account Security */}
        <button
          onClick={() => setActiveModal('accountSecurity')}
          className="flex items-center justify-between p-4 rounded-[20px] bg-[#141824] border border-[#1E2435] hover:border-[#2D364D] active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white/90">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">{t('account_security')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#687593] stroke-[2]" />
        </button>

        {/* Light / Dark Mode with Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-[20px] bg-[#141824] border border-[#1E2435]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white/90">
              <Moon className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">{t('light_dark_mode')}</span>
          </div>

          <button
            onClick={handleToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
              isDarkMode ? 'bg-[#635BFF]' : 'bg-[#313B54]'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <motion.div
              animate={{ x: isDarkMode ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-white w-4 h-4 rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Help & Support */}
        <button
          onClick={() => showToast(language === 'id' ? 'Layanan bantuan aktif 24/7' : 'Support is active 24/7')}
          className="flex items-center justify-between p-4 rounded-[20px] bg-[#141824] border border-[#1E2435] hover:border-[#2D364D] active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#1C2233] flex items-center justify-center text-white/90">
              <Headphones className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">{t('help_support')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#687593] stroke-[2]" />
        </button>
      </div>

      {/* 4. Log Out Section */}
      <div className="pt-2">
        {showLogoutConfirm ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 flex flex-col space-y-2.5">
            <span className="text-xs font-bold text-red-200">{t('logout_confirm_title')}</span>
            <p className="text-[11px] text-red-300/80">
              {t('logout_confirm_desc')}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {t('yes_logout')}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2.5 py-4 rounded-[20px] border border-red-500/30 bg-[#26171E]/40 hover:bg-red-500/15 text-[#EF4444] font-semibold text-sm active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            <span>{t('log_out')}</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1C2233] border border-[#273047] text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl flex items-center space-x-2 z-50 pointer-events-none"
          >
            <Check className="w-4 h-4 text-[#10B981]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
