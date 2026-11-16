'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { SupabaseService } from '@/lib/supabaseService';

export const ResetDatabaseModal: React.FC = () => {
  const { activeModal, setActiveModal, resetData } = useFinance();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isOpen = activeModal === 'resetDatabase';

  const handleClose = () => {
    if (loading) return;
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(false);
    setActiveModal(null);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Silakan masukkan password untuk konfirmasi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isDemo = !user?.email || user.email === 'smith@example.com';

      // 1. Password Verification
      if (isSupabaseConfigured && !isDemo) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: password.trim(),
        });

        if (authError) {
          setError('Password salah. Verifikasi akun gagal.');
          setLoading(false);
          return;
        }
      } else {
        // Fallback for demo user
        if (password.trim() !== 'password123' && password.trim() !== '1234') {
          setError('Password salah. Demo password: password123 atau PIN: 1234');
          setLoading(false);
          return;
        }
      }

      // 2. Wipe Supabase data if configured
      if (isSupabaseConfigured && !isDemo) {
        await SupabaseService.resetUserData();
      }

      // 3. Reset Local Context & Local Storage
      resetData();

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err: any) {
      console.error('Error resetting database:', err);
      setError(err?.message || 'Terjadi kesalahan saat mereset database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reset-db-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="reset-db-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Database
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Database Berhasil Direset!
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#7B88A6] max-w-[240px]">
                  Semua data transaksi dan catatan telah dibersihkan kembali ke kondisi awal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col space-y-4 pt-2">
                {/* Warning Card */}
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300 flex flex-col space-y-1.5">
                  <span className="font-bold flex items-center space-x-1.5">
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Peringatan Penting:</span>
                  </span>
                  <p className="leading-relaxed text-[11px] text-red-600/90 dark:text-red-300/80">
                    Tindakan ini akan <strong>menghapus permanen</strong> seluruh riwayat transaksi, catatan hutang, portofolio aset, anggaran, dan rekening dari database. Data yang sudah dihapus tidak dapat dipulihkan.
                  </p>
                </div>

                {/* Password Input */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#7B88A6] flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Konfirmasi Password Akun</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Masukkan password akun Anda..."
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1C2233] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#4A5568] border border-slate-200 dark:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 transition-all pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-[#687593]">
                    Akun: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.email}</span>
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-100/80 dark:bg-red-950/60 text-xs font-medium text-red-700 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] text-slate-700 dark:text-[#7B88A6] hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mereset...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Reset Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
