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
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <div className="min-h-screen bg-[#0A0D15] flex flex-col justify-center items-center px-5 py-12 text-white selection:bg-[#5B4DF9] selection:text-white">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5950FA] via-[#7547FE] to-[#9C38FE] flex items-center justify-center shadow-[0_10px_28px_rgba(118,71,254,0.4)] mb-3">
            <Wallet className="w-7 h-7 text-white stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">MyPocket</h1>
          <p className="text-xs text-[#7B88A6] mt-1">Smart, luxury personal finance management</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center w-full bg-[#131724] p-1.5 rounded-2xl border border-[#1E253A] mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'email'
                ? 'bg-[#222A3F] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('mpin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'mpin'
                ? 'bg-[#222A3F] text-white shadow-sm'
                : 'text-[#677491] hover:text-white'
            }`}
          >
            mPIN / Biometric
          </button>
        </div>

        {/* Tab 1: Email Login */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="w-full flex flex-col space-y-4">
            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#161B29] border border-[#232C42] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9] transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161B29] border border-[#232C42] rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9] transition-all"
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
              <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#5950FA] to-[#923AFE] text-white text-xs font-bold tracking-wide shadow-[0_8px_22px_rgba(118,71,254,0.35)] active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to MyPocket</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Login button */}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-3 rounded-2xl bg-[#161B29] border border-[#232C42] hover:border-[#5B4DF9] text-xs font-semibold text-white/90 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5B4DF9]" />
              <span>Instant Demo Access (Smith Doe)</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs text-[#7B88A6] hover:text-[#5B4DF9] transition-colors cursor-pointer"
              >
                Don't have an account? <span className="font-semibold text-white">Create Account</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: 4-Digit mPIN & Biometric Login */}
        {authMode === 'mpin' && (
          <div className="w-full flex flex-col items-center">
            {/* Gradient Card matching Screen 3 */}
            <div className="w-full rounded-[26px] p-6 text-white bg-gradient-to-br from-[#5950FA] via-[#7547FE] to-[#9C38FE] shadow-[0_16px_36px_-6px_rgba(118,71,254,0.42)] border border-white/10 mb-5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <button
                type="button"
                onClick={loginWithBiometrics}
                disabled={biometricLoading}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all mx-auto mb-2.5 cursor-pointer"
                aria-label="Unlock with fingerprint"
              >
                {biometricLoading ? (
                  <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-8 h-8 text-white stroke-[1.8]" />
                )}
                <span className="absolute inset-0 rounded-full animate-ping bg-white/15 pointer-events-none" />
              </button>

              <span className="text-xs font-semibold text-white block">Tap fingerprint to quick login</span>
              <span className="text-[11px] text-purple-200/70 block my-0.5">or</span>
              <span className="text-xs font-semibold text-white block">Enter 4-Digit mPIN</span>

              {/* 4 Digit Dots */}
              <div className="flex items-center justify-center space-x-3 mt-3">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pinInput.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                        isFilled ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-110' : 'bg-white/40'
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-[11px] text-red-200 mt-2.5 font-medium bg-red-950/60 py-1 px-3 rounded-full">
                  {pinError}
                </p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (val === 'C') handleKeypadClear();
                    else if (val === '⌫') handleKeypadBackspace();
                    else handleKeypadPress(val);
                  }}
                  className="h-12 rounded-xl bg-[#161B29] border border-[#20273D] hover:bg-[#20283E] active:scale-95 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between w-full max-w-[280px] mt-3 px-2 text-[11px] text-[#7B88A6]">
              <span>Demo PIN: <strong className="text-white">1234</strong></span>
              <button
                type="button"
                onClick={() => handleKeypadClear()}
                className="hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Register */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col space-y-3.5">
            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#161B29] border border-[#232C42] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9] transition-all"
                  required
                />
                <User className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#161B29] border border-[#232C42] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9] transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#7B88A6] font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#161B29] border border-[#232C42] rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#64728E] focus:outline-none focus:border-[#5B4DF9] transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-[#64728E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#5950FA] to-[#923AFE] text-white text-xs font-bold tracking-wide shadow-[0_8px_22px_rgba(118,71,254,0.35)] active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className="text-xs text-[#7B88A6] hover:text-[#5B4DF9] transition-colors cursor-pointer"
              >
                Already registered? <span className="font-semibold text-white">Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

