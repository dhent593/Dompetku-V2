'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { dataService, EMPTY_USER } from '@/lib/dataService';
import { INITIAL_USER } from '@/lib/dummyData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { SupabaseService } from '@/lib/supabaseService';

interface AuthContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isLocked: boolean;
  pinInput: string;
  pinError: string | null;
  biometricLoading: boolean;
  pinAttempts: number;
  pinLockoutRemaining: number;
  handleKeypadPress: (char: string) => void;
  handleKeypadBackspace: () => void;
  handleKeypadClear: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPin: (pinToTest?: string) => boolean;
  loginWithBiometrics: () => Promise<boolean>;
  unlockWithPin: (pinToTest?: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  setPinLockEnabled: (enabled: boolean) => void;
  updateUser: (updated: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);
  const [pinAttempts, setPinAttempts] = useState<number>(0);
  const [pinLockoutUntil, setPinLockoutUntil] = useState<number | null>(null);
  const [pinLockoutRemaining, setPinLockoutRemaining] = useState<number>(0);

  // Keypad Lockout Countdown Timer
  useEffect(() => {
    if (!pinLockoutUntil) return;
    const interval = setInterval(() => {
      const diff = Math.ceil((pinLockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setPinLockoutUntil(null);
        setPinLockoutRemaining(0);
        setPinAttempts(0);
        setPinError(null);
        clearInterval(interval);
      } else {
        setPinLockoutRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pinLockoutUntil]);

  // Helper to determine if app should be locked on startup
  const checkAndLockUser = (targetUser: UserProfile) => {
    const isDemo = targetUser.email === 'smith@example.com';
    const hasPin = isDemo || Boolean(targetUser.pinCreated && targetUser.mPinHash && targetUser.mPinHash.trim().length === 4);
    const isPinActive = targetUser.pinEnabled === true && hasPin;
    if (isPinActive) {
      setIsLocked(true);
      dataService.setAppLocked(true);
    } else {
      setIsLocked(false);
      dataService.setAppLocked(false);
    }
  };

  useEffect(() => {
    // If Supabase is configured, listen to active session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        try {
          if (session?.user) {
            setIsLoggedIn(true);
            dataService.setAuthState(true);
            const profile = await SupabaseService.getProfile();
            if (profile) {
              setUser(profile);
              dataService.saveUser(profile);
              checkAndLockUser(profile);
            } else {
              const fallback: UserProfile = {
                ...EMPTY_USER,
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
              };
              setUser(fallback);
              dataService.saveUser(fallback);
              checkAndLockUser(fallback);
            }
          } else {
            // If no Supabase session, check stored auth state
            const storedAuth = dataService.getAuthState();
            if (storedAuth) {
              const initialUser = dataService.getUser();
              setUser(initialUser);
              setIsLoggedIn(true);
              checkAndLockUser(initialUser);
            } else {
              setIsLoggedIn(false);
              setIsLocked(false);
              setUser(EMPTY_USER);
            }
          }
        } finally {
          setIsAuthLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          dataService.setAuthState(true);
          const profile = await SupabaseService.getProfile();
          if (profile) {
            setUser(profile);
            dataService.saveUser(profile);
            checkAndLockUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setIsLocked(false);
          dataService.setAuthState(false);
          setUser(EMPTY_USER);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const storedAuth = dataService.getAuthState();
      if (storedAuth) {
        const initialUser = dataService.getUser();
        setUser(initialUser);
        setIsLoggedIn(true);
        checkAndLockUser(initialUser);
      } else {
        setUser(EMPTY_USER);
        setIsLoggedIn(false);
        setIsLocked(false);
      }
      setIsAuthLoading(false);
    }
  }, []);

  const handleKeypadPress = (char: string) => {
    if (pinLockoutUntil && Date.now() < pinLockoutUntil) return;
    if (pinInput.length < 4) {
      const nextPin = pinInput + char;
      setPinInput(nextPin);
      setPinError(null);

      // Auto verify when 4 digits reached
      if (nextPin.length === 4) {
        setTimeout(() => {
          verifyPin(nextPin);
        }, 150);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (pinLockoutUntil && Date.now() < pinLockoutUntil) return;
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleKeypadClear = () => {
    if (pinLockoutUntil && Date.now() < pinLockoutUntil) return;
    setPinInput('');
    setPinError(null);
  };

  const verifyPin = (pinToTest: string): boolean => {
    if (pinLockoutUntil && Date.now() < pinLockoutUntil) {
      const diff = Math.ceil((pinLockoutUntil - Date.now()) / 1000);
      setPinError(`Keypad terkunci. Coba lagi dalam ${diff} detik.`);
      return false;
    }

    const isDemo = user.email === 'smith@example.com';
    const isValid = (user.pinCreated && pinToTest === user.mPinHash) || (isDemo && (pinToTest === user.mPinHash || pinToTest === '1234'));

    if (isValid) {
      setIsLocked(false);
      setIsLoggedIn(true);
      dataService.setAuthState(true);
      setPinInput('');
      setPinError(null);
      setPinAttempts(0);
      setPinLockoutUntil(null);
      setPinLockoutRemaining(0);
      dataService.setAppLocked(false);
      return true;
    } else {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const lockUntil = Date.now() + 30000;
        setPinLockoutUntil(lockUntil);
        setPinLockoutRemaining(30);
        setPinError('Terlalu banyak percobaan gagal. Keypad terkunci 30 detik.');
      } else {
        setPinError(`mPIN salah (${nextAttempts}/5).`);
      }
      setTimeout(() => {
        setPinInput('');
      }, 600);
      return false;
    }
  };

  const loginWithPin = (pinToTest?: string): boolean => {
    const target = pinToTest || pinInput;
    return verifyPin(target);
  };

  const unlockWithPin = (pinToTest?: string): boolean => {
    return loginWithPin(pinToTest);
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    setBiometricLoading(true);
    setPinError(null);
    try {
      // 1. Try WebAuthn platform authenticator if available on device
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (available) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            await navigator.credentials.get({
              publicKey: {
                challenge,
                timeout: 60000,
                userVerification: 'preferred',
                rpId: window.location.hostname || undefined,
              },
            });
            setIsLocked(false);
            setIsLoggedIn(true);
            dataService.setAuthState(true);
            dataService.setAppLocked(false);
            setPinInput('');
            return true;
          }
        } catch (webAuthnErr: any) {
          if (webAuthnErr?.name === 'NotAllowedError') {
            setPinError('Verifikasi sidik jari dibatalkan.');
            return false;
          }
        }
      }

      // 2. Simulation fallback for smooth experience
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLocked(false);
      setIsLoggedIn(true);
      dataService.setAuthState(true);
      dataService.setAppLocked(false);
      setPinInput('');
      return true;
    } catch {
      setPinError('Verifikasi biometrik gagal.');
      return false;
    } finally {
      setBiometricLoading(false);
    }
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    return loginWithBiometrics();
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) return { success: false, error: 'Email dan kata sandi wajib diisi.' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          setIsLoggedIn(true);
          setIsLocked(false);
          dataService.setAuthState(true);
          dataService.setAppLocked(false);
          const profile = await SupabaseService.getProfile();
          if (profile) {
            setUser(profile);
            dataService.saveUser(profile);
          } else {
            const fallback: UserProfile = {
              ...EMPTY_USER,
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split('@')[0] || 'User',
              email: cleanEmail,
            };
            setUser(fallback);
            dataService.saveUser(fallback);
          }
          return { success: true };
        }

        // Check local registered credentials fallback
        const localAcc = dataService.verifyLocalCredentials(cleanEmail, pass);
        if (localAcc) {
          const localUser: UserProfile = {
            ...EMPTY_USER,
            id: `usr_${Date.now()}`,
            name: localAcc.name,
            email: localAcc.email,
          };
          setUser(localUser);
          dataService.saveUser(localUser);
          setIsLoggedIn(true);
          setIsLocked(false);
          dataService.setAuthState(true);
          dataService.setAppLocked(false);
          return { success: true };
        }

        // Demo user credentials fallback
        if (cleanEmail === 'smith@example.com' && pass === 'password123') {
          setIsLoggedIn(true);
          setIsLocked(false);
          dataService.setAuthState(true);
          dataService.setAppLocked(false);
          setUser(INITIAL_USER);
          dataService.saveUser(INITIAL_USER);
          return { success: true };
        }

        // Specific error handling from Supabase
        if (error?.message?.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email belum dikonfirmasi. Silakan matikan "Confirm email" di dashboard Supabase (Authentication > Providers > Email) atau periksa kotak masuk email Anda.',
          };
        }

        if (error?.message?.toLowerCase().includes('invalid login credentials')) {
          return { success: false, error: 'Email atau kata sandi salah. Silakan periksa kembali.' };
        }

        return { success: false, error: error?.message || 'Gagal masuk. Silakan coba lagi.' };
      } catch (err: any) {
        console.error('Login error', err);
        return { success: false, error: err?.message || 'Terjadi kesalahan saat masuk.' };
      }
    }

    // Local-only verification
    const localAcc = dataService.verifyLocalCredentials(cleanEmail, pass);
    if (localAcc) {
      const localUser: UserProfile = {
        ...EMPTY_USER,
        id: `usr_${Date.now()}`,
        name: localAcc.name,
        email: localAcc.email,
      };
      setUser(localUser);
      dataService.saveUser(localUser);
      setIsLoggedIn(true);
      setIsLocked(false);
      dataService.setAuthState(true);
      dataService.setAppLocked(false);
      return { success: true };
    }

    if (cleanEmail === 'smith@example.com' && pass === 'password123') {
      setIsLoggedIn(true);
      setIsLocked(false);
      dataService.setAuthState(true);
      dataService.setAppLocked(false);
      setUser(INITIAL_USER);
      dataService.saveUser(INITIAL_USER);
      return { success: true };
    }

    return { success: false, error: 'Email atau kata sandi tidak cocok.' };
  };

  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !pass) {
      return { success: false, error: 'Mohon lengkapi semua kolom pendaftaran.' };
    }

    // Always cache registered account locally
    dataService.saveRegisteredAccount({
      name: cleanName,
      email: cleanEmail,
      pass,
    });

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
            },
          },
        });

        if (error) {
          console.warn('Supabase register notice:', error.message);
          if (error.message.toLowerCase().includes('already registered')) {
            return { success: false, error: 'Email ini sudah terdaftar. Silakan langsung Masuk.' };
          }
        }

        if (data?.user) {
          setIsLoggedIn(true);
          setIsLocked(false);
          dataService.setAuthState(true);
          dataService.setAppLocked(false);

          if (data.session) {
            const profile = await SupabaseService.getProfile();
            if (profile) {
              setUser(profile);
              dataService.saveUser(profile);
            }
          } else {
            const newUser: UserProfile = {
              ...EMPTY_USER,
              id: data.user.id,
              name: cleanName,
              email: cleanEmail,
            };
            setUser(newUser);
            dataService.saveUser(newUser);
          }
          return { success: true };
        }
      } catch (err: any) {
        console.error('Register error', err);
      }
    }

    // Default simulation fallback
    const newUser: UserProfile = {
      ...EMPTY_USER,
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
    };
    setUser(newUser);
    dataService.saveUser(newUser);
    setIsLoggedIn(true);
    setIsLocked(false);
    dataService.setAuthState(true);
    dataService.setAppLocked(false);
    return { success: true };
  };

  const lockApp = () => {
    setIsLocked(true);
    setPinInput('');
    setPinError(null);
    dataService.setAppLocked(true);
  };

  const setPinLockEnabled = (enabled: boolean) => {
    updateUser({ pinEnabled: enabled });
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      dataService.saveUser(next);
      if (isSupabaseConfigured) {
        SupabaseService.updateProfile(updated);
      }
      return next;
    });
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    setIsLoggedIn(false);
    setIsLocked(false);
    dataService.setAuthState(false);
    setUser(EMPTY_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthLoading,
        isLocked,
        pinInput,
        pinError,
        biometricLoading,
        pinAttempts,
        pinLockoutRemaining,
        handleKeypadPress,
        handleKeypadBackspace,
        handleKeypadClear,
        loginWithEmail,
        register,
        loginWithPin,
        loginWithBiometrics,
        unlockWithPin,
        unlockWithBiometrics,
        lockApp,
        setPinLockEnabled,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
