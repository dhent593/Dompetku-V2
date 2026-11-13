'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { dataService } from '@/lib/dataService';
import { INITIAL_USER } from '@/lib/dummyData';

interface AuthContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  isLocked: boolean;
  pinInput: string;
  pinError: string | null;
  biometricLoading: boolean;
  pinAttempts: number;
  handleKeypadPress: (char: string) => void;
  handleKeypadBackspace: () => void;
  handleKeypadClear: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithPin: (pinToTest?: string) => boolean;
  loginWithBiometrics: () => Promise<boolean>;
  unlockWithPin: (pinToTest?: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);
  const [pinAttempts, setPinAttempts] = useState<number>(0);

  useEffect(() => {
    // Initial fetch from dataService
    const initialUser = dataService.getUser();
    setUser(initialUser);
    setIsLoggedIn(dataService.getAuthState());
  }, []);

  const handleKeypadPress = (char: string) => {
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
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setPinError(null);
  };

  const verifyPin = (pinToTest: string): boolean => {
    if (pinToTest === user.mPinHash || pinToTest === '1234') {
      setIsLocked(false);
      setIsLoggedIn(true);
      dataService.setAuthState(true);
      setPinInput('');
      setPinError(null);
      setPinAttempts(0);
      dataService.setAppLocked(false);
      return true;
    } else {
      setPinError('Invalid 4-digit mPIN. Demo PIN is 1234');
      setPinAttempts((prev) => prev + 1);
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLocked(false);
      setIsLoggedIn(true);
      dataService.setAuthState(true);
      dataService.setAppLocked(false);
      setPinInput('');
      return true;
    } catch {
      setPinError('Biometric verification failed');
      return false;
    } finally {
      setBiometricLoading(false);
    }
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    return loginWithBiometrics();
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    if (!email || !pass) return false;
    // Simulate server authentication delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoggedIn(true);
    setIsLocked(false);
    dataService.setAuthState(true);
    dataService.setAppLocked(false);
    return true;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (!name || !email || !pass) return false;
    await new Promise((resolve) => setTimeout(resolve, 600));
    const updated = {
      ...user,
      name,
      email,
    };
    setUser(updated);
    dataService.saveUser(updated);
    setIsLoggedIn(true);
    setIsLocked(false);
    dataService.setAuthState(true);
    return true;
  };

  const lockApp = () => {
    setIsLocked(true);
    setPinInput('');
    setPinError(null);
    dataService.setAppLocked(true);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      dataService.saveUser(next);
      return next;
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsLocked(false);
    dataService.setAuthState(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLocked,
        pinInput,
        pinError,
        biometricLoading,
        pinAttempts,
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
