'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wallet,
  Landmark,
  Shield,
  Plane,
  Smartphone,
  Heart,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  Check,
  AlertCircle,
  Pipette,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { POCKET_COLOR_PRESETS } from '@/lib/dummyData';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency } from '@/lib/utils';

const AVAILABLE_ICONS = [
  { id: 'Wallet', icon: Wallet, label: 'Dompet' },
  { id: 'Landmark', icon: Landmark, label: 'Bank' },
  { id: 'Shield', icon: Shield, label: 'Darurat' },
  { id: 'Plane', icon: Plane, label: 'Liburan' },
  { id: 'Smartphone', icon: Smartphone, label: 'Gadget' },
  { id: 'Heart', icon: Heart, label: 'Kesehatan' },
  { id: 'ShoppingBag', icon: ShoppingBag, label: 'Belanja' },
  { id: 'Car', icon: Car, label: 'Kendaraan' },
  { id: 'Home', icon: Home, label: 'Rumah' },
  { id: 'Briefcase', icon: Briefcase, label: 'Bisnis' },
];

export const AddPocketModal: React.FC = () => {
  const { activeModal, setActiveModal, addPocket } = useFinance();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [selectedColor, setSelectedColor] = useState('#635BFF');
  const [selectedIcon, setSelectedIcon] = useState('Shield');
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'addPocket';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('pocket_name_label'));
      return;
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Target saldo harus lebih dari 0');
      return;
    }

    const depositNum = initialDeposit.trim() ? parseFloat(initialDeposit) : 0;
    if (isNaN(depositNum) || depositNum < 0) {
      setError('Setoran awal tidak valid');
      return;
    }

    if (depositNum > user.balance) {
      setError(`Setoran awal melebihi saldo tersedia (${formatCurrency(user.balance)})`);
      return;
    }

    addPocket({
      name: name.trim(),
      balance: depositNum,
      targetAmount: targetNum,
      color: selectedColor,
      iconName: selectedIcon,
    });

    // Reset & close
    setName('');
    setTargetAmount('');
    setInitialDeposit('');
    setSelectedColor('#635BFF');
    setSelectedIcon('Shield');
    setError(null);
    setActiveModal(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="addpocket-backdrop"
          variants={snappyBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="addpocket-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center pocket-icon-badge text-white shadow-sm [&>svg]:text-white [&>svg]:stroke-white"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Wallet className="w-4 h-4 text-white stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('create_pocket_title')}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setError(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-4">
              {/* Pocket Name */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">
                  {t('pocket_name_label')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Dana Darurat, Liburan Jepang"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1.5">
                  {t('pocket_target_input')}
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. 5000000"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Initial Deposit (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium">
                    {t('pocket_initial_deposit')}
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">
                    {t('available_label')}: {formatCurrency(user.balance)}
                  </span>
                </div>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={initialDeposit}
                  onChange={(e) => {
                    setInitialDeposit(e.target.value);
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64728E] focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                />
              </div>

              {/* Color Preset & Custom Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium">
                    {t('pocket_color_label')}
                  </label>
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#1C2233] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-[#273047]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-[11px] font-mono text-slate-800 dark:text-white/90 uppercase font-semibold">
                      {selectedColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  {POCKET_COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedColor(preset.hex)}
                        title={preset.name}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'scale-110 ring-2 ring-slate-400 dark:ring-white/80 ring-offset-2 ring-offset-white dark:ring-offset-[#141824]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    );
                  })}

                  {/* Custom Color Button with Native Pipette / Spectrum Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      title={t('custom_color')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                        !POCKET_COLOR_PRESETS.some(
                          (p) => p.hex.toLowerCase() === selectedColor.toLowerCase()
                        )
                          ? 'scale-110 ring-2 ring-slate-400 dark:ring-white/80 ring-offset-2 ring-offset-white dark:ring-offset-[#141824]'
                          : 'border border-dashed border-slate-300 dark:border-[#3E4A68] hover:border-slate-500 dark:hover:border-white/60 bg-slate-100 dark:bg-[#1C2233]'
                      }`}
                      style={{
                        backgroundColor: !POCKET_COLOR_PRESETS.some(
                          (p) => p.hex.toLowerCase() === selectedColor.toLowerCase()
                        )
                          ? selectedColor
                          : undefined,
                      }}
                    >
                      {!POCKET_COLOR_PRESETS.some(
                        (p) => p.hex.toLowerCase() === selectedColor.toLowerCase()
                      ) ? (
                        <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-sm" />
                      ) : (
                        <Pipette className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800 dark:text-[#A0AEC0] dark:hover:text-white transition-colors" />
                      )}
                      <input
                        type="color"
                        value={
                          selectedColor.startsWith('#') && selectedColor.length === 7
                            ? selectedColor
                            : '#8B5CF6'
                        }
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        title={t('custom_color')}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Icon Selector (10 Icons: Bank, Dompet, etc.) */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-2">
                  {t('pocket_icon_label')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIcon(item.id)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-200 dark:bg-[#1C2233] text-slate-900 dark:text-white border-slate-400 dark:border-white/40 shadow-sm'
                            : 'bg-slate-50 dark:bg-[#141824] border-slate-200 dark:border-[#1E2435] text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white hover:border-slate-300 dark:hover:border-[#2A344A]'
                        }`}
                        title={item.label}
                      >
                        <IconComp
                          className="w-4 h-4 stroke-[2]"
                          style={{ color: isSelected ? selectedColor : undefined }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-3.5 rounded-xl text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-1 cursor-pointer shadow-sm"
                style={{ backgroundColor: selectedColor }}
              >
                {t('save_pocket_btn')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
