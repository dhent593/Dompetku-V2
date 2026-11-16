'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const LoginView: React.FC = () => {
  const { loginWithEmail, register } = useAuth();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Silakan lengkapi email dan kata sandi.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await loginWithEmail(email.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Email atau kata sandi tidak sesuai.');
      }
    } catch {
      setErrorMsg('Gagal masuk. Silakan periksa koneksi Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Silakan lengkapi semua kolom pendaftaran.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('password_mismatch'));
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.16 } },
  };

  return (
    <div className="min-h-screen bg-[#0A0D15] flex flex-col justify-center items-center px-5 py-12 text-white selection:bg-[#635BFF] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#635BFF] flex items-center justify-center shadow-lg shadow-[#635BFF]/25 mb-3.5">
            <Wallet className="w-7 h-7 text-white stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">MyPocket</h1>
          <p className="text-xs text-[#7B88A6] mt-1">{t('welcome_sub')}</p>
        </motion.div>

        {/* Auth Mode Tabs: Masuk vs Daftar Baru */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center w-full bg-[#111520] p-1.5 rounded-2xl mb-6 border border-[#1E2435]/60"
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
              setPassword('');
              setConfirmPassword('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#1C2233] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            {t('email_login_tab')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
              setPassword('');
              setConfirmPassword('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#1C2233] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            {t('register_tab')}
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Form 1: Masuk (Login) */}
          {authMode === 'login' && (
            <motion.form
              key="login-form"
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
                    placeholder="nama@email.com"
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
                    className="absolute right-3.5 top-3.5 text-[#64728E] hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-950/40 border border-red-900/30 p-3 rounded-xl"
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <span>{t('sign_in_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-xs text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  {t('dont_have_account')}{' '}
                  <span className="font-semibold text-white underline underline-offset-2">{t('create_account')}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Form 2: Daftar Baru (Register) */}
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
                    placeholder="Contoh: Arif Setiawan"
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
                    placeholder="nama@email.com"
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
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#64728E] hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7B88A6] font-medium block mb-1">{t('repeat_password_label')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('repeat_password_placeholder')}
                    className="w-full bg-[#141824] border border-[#1E2435] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-[#64728E] hover:text-white cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-950/40 border border-red-900/30 p-3 rounded-xl"
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </div>
                ) : (
                  <>
                    <span>{t('complete_reg')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-xs text-[#7B88A6] hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  {t('already_registered')}{' '}
                  <span className="font-semibold text-white underline underline-offset-2">{t('email_login_tab')}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
