'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { dataService } from '@/lib/dataService';

interface AuthContextType {
  user: UserProfile;
  isLocked: boolean;
  pinInput: string;
  pinError: string | null;
  biometricLoading: boolean;
  pinAttempts: number;
  handleKeypadPress: (char: string) => void;
  handleKeypadBackspace: () => void;
  handleKeypadClear: () => void;
  unlockWithPin: (pinToTest?: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(dataService.getUser());
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);
  const [pinAttempts, setPinAttempts] = useState<number>(0);

  useEffect(() => {
    // Initial fetch from dataService
    const initialUser = dataService.getUser();
    setUser(initialUser);
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
      setPinInput('');
      setPinError(null);
      setPinAttempts(0);
      dataService.setAppLocked(false);
      return true;
    } else {
      setPinError('Invalid 4-digit mPIN. Hint: 1234');
      setPinAttempts((prev) => prev + 1);
      setTimeout(() => {
        setPinInput('');
      }, 600);
      return false;
    }
  };

  const unlockWithPin = (pinToTest?: string): boolean => {
    const target = pinToTest || pinInput;
    return verifyPin(target);
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    setBiometricLoading(true);
    setPinError(null);
    try {
      // Simulate biometric sensor read
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLocked(false);
      setPinInput('');
      dataService.setAppLocked(false);
      return true;
    } catch {
      setPinError('Biometric authentication failed');
      return false;
    } finally {
      setBiometricLoading(false);
    }
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
    lockApp();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLocked,
        pinInput,
        pinError,
        biometricLoading,
        pinAttempts,
        handleKeypadPress,
        handleKeypadBackspace,
        handleKeypadClear,
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
