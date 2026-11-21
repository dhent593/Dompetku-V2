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
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { POCKET_COLOR_PRESETS } from '@/lib/dummyData';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';

const AVAILABLE_ICONS = [
  { id: 'Wallet', icon: Wallet, labelId: 'Dompet', labelEn: 'Wallet' },
  { id: 'Landmark', icon: Landmark, labelId: 'Bank', labelEn: 'Bank' },
  { id: 'Shield', icon: Shield, labelId: 'Darurat', labelEn: 'Emergency' },
  { id: 'Plane', icon: Plane, labelId: 'Liburan', labelEn: 'Vacation' },
  { id: 'Smartphone', icon: Smartphone, labelId: 'Gadget', labelEn: 'Gadget' },
  { id: 'Heart', icon: Heart, labelId: 'Kesehatan', labelEn: 'Health' },
  { id: 'ShoppingBag', icon: ShoppingBag, labelId: 'Belanja', labelEn: 'Shopping' },
  { id: 'Car', icon: Car, labelId: 'Kendaraan', labelEn: 'Vehicle' },
  { id: 'Home', icon: Home, labelId: 'Rumah', labelEn: 'Home' },
  { id: 'Briefcase', icon: Briefcase, labelId: 'Bisnis', labelEn: 'Business' },
];

export const AddPocketModal: React.FC = () => {
  const { activeModal, setActiveModal, addPocket } = useFinance();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [selectedColor, setSelectedColor] = useState('#635BFF');
  const [selectedIcon, setSelectedIcon] = useState('Shield');
  const [isAsset, setIsAsset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'addPocket';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('pocket_name_label'));
      return;
    }

    const targetNum = parseNumberInput(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Target saldo harus lebih dari 0');
      return;
    }

    const depositNum = initialDeposit.trim() ? parseNumberInput(initialDeposit) : 0;
    if (isNaN(depositNum) || depositNum < 0) {
      setError(language === 'id' ? 'Setoran awal tidak valid' : 'Invalid initial deposit');
      return;
    }

    if (targetNum > 0 && depositNum > targetNum) {
      setError(
        language === 'id'
          ? 'Setoran awal tidak boleh melebihi target saldo'
          : 'Initial deposit cannot exceed target amount'
      );
      return;
    }

    addPocket({
      name: name.trim(),
      balance: depositNum,
      targetAmount: targetNum,
      color: selectedColor,
      iconName: selectedIcon,
      isAsset,
    });

    // Reset & close
    setName('');
    setTargetAmount('');
    setInitialDeposit('');
    setSelectedColor('#635BFF');
    setSelectedIcon('Shield');
    setIsAsset(false);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-[2px]"
        >
          <motion.div
            key="addpocket-modal"
            variants={snappyGelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto transform-gpu will-change-transform"
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
                  type="text"
                  inputMode="numeric"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(formatNumberInput(e.target.value));
                    setError(null);
                  }}
                  placeholder="e.g. 5.000.000"
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
                  {initialDeposit && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#10B981]">
                      Saldo: Rp{initialDeposit}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialDeposit}
                  onChange={(e) => {
                    setInitialDeposit(formatNumberInput(e.target.value));
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
                        title={language === 'id' ? item.labelId : item.labelEn}
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

              {/* Asset Classification Toggle Card */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isAsset
                      ? 'bg-amber-400/20 text-amber-500 dark:text-amber-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {language === 'id' ? 'Labeli sebagai Aset' : 'Label as Asset'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#7B88A6] block leading-tight">
                      {language === 'id' ? 'Masuk ke Portofolio Aset, keluar dari Saldo Tersedia' : 'In Asset Portfolio, out of available balance'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAsset(!isAsset)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                    isAsset ? 'bg-[#635BFF]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-label="Toggle Asset"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                      isAsset ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
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
