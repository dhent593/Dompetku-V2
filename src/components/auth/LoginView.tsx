'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Fingerprint,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const LoginView: React.FC = () => {
  const {
    loginWithEmail,
    register,
    loginWithBiometrics,
    handleKeypadPress,
    handleKeypadBackspace,
    handleKeypadClear,
    pinInput,
    pinError,
    biometricLoading,
  } = useAuth();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'mpin' | 'email' | 'register'>('email');
  const [email, setEmail] = useState('smith@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const ok = await loginWithEmail(email, password);
      if (!ok) {
        setErrorMsg('Invalid email or password.');
      }
    } catch {
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await register(name.trim(), email, password);
    } catch {
      setErrorMsg('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    await loginWithEmail('smith@example.com', 'password123');
    setIsLoading(false);
  };

  const formVariants = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#0A0D15] flex flex-col justify-center items-center px-5 py-12 text-white selection:bg-[#635BFF] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#635BFF] flex items-center justify-center shadow-lg shadow-[#635BFF]/20 mb-3">
            <Wallet className="w-7 h-7 text-white stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">MyPocket</h1>
          <p className="text-xs text-[#7B88A6] mt-1">{t('welcome_sub')}</p>
        </motion.div>

        {/* Auth Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center w-full bg-[#111520] p-1.5 rounded-2xl mb-6"
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'email'
                ? 'bg-[#1C2233] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            {t('email_login_tab')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('mpin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'mpin'
                ? 'bg-[#1C2233] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            {t('mpin_login_tab')}
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Tab 1: Email Login */}
          {authMode === 'email' && (
            <motion.form
              key="email-form"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleEmailSubmit}
              className="w-full flex flex-col space-y-4"
            >
              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">{t('email_label')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">{t('password_label')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#64728E] hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl"
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 shadow-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('sign_in_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-3 rounded-xl bg-[#141824] hover:bg-[#1E2435] text-xs font-semibold text-white/90 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{t('instant_demo')}</span>
              </motion.button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  {t('dont_have_account')}{' '}
                  <span className="font-semibold text-white">{t('create_account')}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Tab 2: 4-Digit mPIN & Biometric Login */}
          {authMode === 'mpin' && (
            <motion.div
              key="mpin-form"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center"
            >
              {/* Solid Card */}
              <div className="w-full rounded-[24px] p-6 text-white bg-[#635BFF] shadow-lg shadow-[#635BFF]/15 mb-5 text-center relative overflow-hidden">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={loginWithBiometrics}
                  disabled={biometricLoading}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all mx-auto mb-2.5 cursor-pointer"
                  aria-label={t('unlock_fingerprint')}
                >
                  {biometricLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Fingerprint className="w-8 h-8 text-white stroke-[1.8]" />
                  )}
                </motion.button>

                <span className="text-xs font-semibold text-white block">{t('tap_fingerprint')}</span>
                <span className="text-[11px] text-white/70 block my-0.5">{t('or')}</span>
                <span className="text-xs font-semibold text-white block">{t('enter_mpin')}</span>

                {/* 4 Digit Dots */}
                <div className="flex items-center justify-center space-x-3 mt-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pinInput.length > idx;
                    return (
                      <motion.div
                        key={idx}
                        animate={{ scale: isFilled ? 1.15 : 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                          isFilled ? 'bg-white shadow-sm' : 'bg-white/40'
                        }`}
                      />
                    );
                  })}
                </div>

                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[11px] text-white mt-2.5 font-medium bg-black/30 py-1 px-3 rounded-full"
                  >
                    {pinError}
                  </motion.p>
                )}
              </div>

              {/* Keypad with bouncy press */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((val) => (
                  <motion.button
                    key={val}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => {
                      if (val === 'C') handleKeypadClear();
                      else if (val === '⌫') handleKeypadBackspace();
                      else handleKeypadPress(val);
                    }}
                    className="h-12 rounded-xl bg-[#141824] hover:bg-[#1C2233] active:scale-95 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    {val}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between w-full max-w-[280px] mt-3 px-2 text-[11px] text-[#7B88A6]">
                <span>{t('demo_pin_hint')}</span>
                <button
                  type="button"
                  onClick={() => handleKeypadClear()}
                  className="hover:text-white cursor-pointer"
                >
                  {t('clear')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Register */}
          {authMode === 'register' && (
            <motion.form
              key="register-form"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleRegisterSubmit}
              className="w-full flex flex-col space-y-3.5"
            >
              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('full_name')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('email_label')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('password_label')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 shadow-sm"
              >
                <span>{t('complete_reg')}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className="text-xs text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  {t('already_registered')}{' '}
                  <span className="font-semibold text-white">{t('sign_in_btn')}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
