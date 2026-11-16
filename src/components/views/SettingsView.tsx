'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Pencil,
  Shield,
  Moon,
  Sun,
  Headphones,
  ChevronRight,
  LogOut,
  Check,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { setActiveModal } = useFinance();
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
    showToast(
      isDarkMode
        ? (language === 'id' ? 'Mode Terang diaktifkan' : 'Light Mode activated')
        : (language === 'id' ? 'Mode Gelap diaktifkan' : 'Dark Mode activated')
    );
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="flex flex-col space-y-5 text-slate-900 dark:text-white w-full">
      {/* 1. Top Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('settings_title')}</h1>
      </div>

      {/* 2. User Profile Card */}
      <div className="flex items-center justify-between p-4 rounded-[22px] bg-white dark:bg-[#141824] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90 overflow-hidden shadow-inner">
              <User className="w-7 h-7 stroke-[1.8]" />
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] absolute bottom-0 right-0 shadow-sm" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{user.name} Doe</h2>
            <p className="text-xs text-slate-500 dark:text-[#7B88A6] mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('editProfile')}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-700 dark:text-white/90 active:scale-90 transition-all cursor-pointer"
          aria-label="Edit Profile"
        >
          <Pencil className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* 3. Settings List */}
      <div className="flex flex-col space-y-3 pt-1">
        {/* Language Switcher Setting */}
        <div className="flex items-center justify-between p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90">
              <Globe className="w-5 h-5 stroke-[2] text-[#635BFF]" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight block">
                {t('language_setting')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                {language === 'id' ? 'Bahasa Indonesia aktif' : 'English active'}
              </span>
            </div>
          </div>

          {/* Clean Segmented Language Pill */}
          <div className="flex bg-slate-100 dark:bg-[#111520] p-1 rounded-xl">
            <button
              onClick={() => {
                setLanguage('id');
                showToast('Bahasa diubah ke Indonesia');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'id'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
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
                  : 'text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Account Security */}
        <button
          onClick={() => setActiveModal('accountSecurity')}
          className="flex items-center justify-between p-4 rounded-[20px] bg-white dark:bg-[#141824] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{t('account_security')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#687593] stroke-[2]" />
        </button>

        {/* Light / Dark Mode with Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-[20px] bg-white dark:bg-[#141824] shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90">
              {isDarkMode ? (
                <Moon className="w-5 h-5 stroke-[2] text-[#635BFF]" />
              ) : (
                <Sun className="w-5 h-5 stroke-[2] text-amber-500" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight block">
                {t('light_dark_mode')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                {isDarkMode
                  ? (language === 'id' ? 'Mode Gelap aktif' : 'Dark Mode active')
                  : (language === 'id' ? 'Mode Terang aktif' : 'Light Mode active')}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
              isDarkMode ? 'bg-[#635BFF]' : 'bg-slate-300'
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
          className="flex items-center justify-between p-4 rounded-[20px] bg-white dark:bg-[#141824] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-slate-700 dark:text-white/90">
              <Headphones className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{t('help_support')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#687593] stroke-[2]" />
        </button>
      </div>

      {/* 4. Log Out Section */}
      <div className="pt-2">
        {showLogoutConfirm ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 flex flex-col space-y-2.5">
            <span className="text-xs font-bold text-red-700 dark:text-red-200">{t('logout_confirm_title')}</span>
            <p className="text-[11px] text-red-600 dark:text-red-300/80">
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
                className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#1C2233] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2.5 py-4 rounded-[20px] bg-red-50/50 dark:bg-[#26171E]/40 hover:bg-red-100/60 dark:hover:bg-red-500/15 text-red-600 dark:text-[#EF4444] font-semibold text-sm active:scale-[0.98] transition-all shadow-sm cursor-pointer"
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-[#1C2233] text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl flex items-center space-x-2 z-50 pointer-events-none"
          >
            <Check className="w-4 h-4 text-[#10B981]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
