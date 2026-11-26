'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Pipette,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency } from '@/lib/utils';

// Curated solid color presets
const SOLID_PRESETS = [
  { id: 'indigo', name: 'Indigo Glow', value: '#635BFF' },
  { id: 'slate', name: 'Dark Slate', value: '#0F172A' },
  { id: 'emerald', name: 'Emerald Forest', value: '#059669' },
  { id: 'sapphire', name: 'Sapphire Blue', value: '#2563EB' },
  { id: 'amber', name: 'Sunset Amber', value: '#D97706' },
  { id: 'violet', name: 'Royal Violet', value: '#7C3AED' },
  { id: 'rose', name: 'Ruby Rose', value: '#E11D48' },
  { id: 'teal', name: 'Midnight Teal', value: '#0D9488' },
  { id: 'oled', name: 'Pure OLED', value: '#09090B' },
  { id: 'titanium', name: 'Titanium Gray', value: '#334155' },
  { id: 'cyan', name: 'Azure Cyan', value: '#0284C7' },
  { id: 'wine', name: 'Deep Wine', value: '#831843' },
];

// Curated modern gradient presets
const GRADIENT_PRESETS = [
  {
    id: 'aurora',
    name: 'Aurora Glow',
    value: 'linear-gradient(135deg, #635BFF 0%, #EC4899 100%)',
    preview: '#635BFF',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    value: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)',
    preview: '#1E3A8A',
  },
  {
    id: 'emerald_glow',
    name: 'Emerald Glow',
    value: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
    preview: '#064E3B',
  },
  {
    id: 'velvet',
    name: 'Velvet Dusk',
    value: 'linear-gradient(135deg, #4C1D95 0%, #BE185D 100%)',
    preview: '#4C1D95',
  },
  {
    id: 'sunset_glow',
    name: 'Warm Sunset',
    value: 'linear-gradient(135deg, #9A3412 0%, #F59E0B 100%)',
    preview: '#9A3412',
  },
  {
    id: 'midnight_neon',
    name: 'Midnight Neon',
    value: 'linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)',
    preview: '#0F172A',
  },
];

export const CustomizeCardModal: React.FC = () => {
  const { activeModal, setActiveModal, balanceCardColor, setBalanceCardColor, pockets, transactions } =
    useFinance();
  const { language } = useLanguage();

  const isOpen = activeModal === 'customizeBalanceCard';

  // Temporary color selection state before applying
  const [selectedColor, setSelectedColor] = useState<string>('default');
  const [hexInput, setHexInput] = useState<string>('#635BFF');

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const current = balanceCardColor || 'default';
      setSelectedColor(current);
      if (current.startsWith('#') && (current.length === 7 || current.length === 9)) {
        setHexInput(current);
      } else {
        setHexInput('#635BFF');
      }
    }
  }, [isOpen, balanceCardColor]);

  if (!isOpen) return null;

  // Calculate quick values for preview card
  const availableBalance = pockets
    .filter((p) => !p.isAsset)
    .reduce((sum, p) => sum + p.balance, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'income' &&
        t.category !== 'transfer' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        t.category !== 'transfer' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApply = () => {
    setBalanceCardColor(selectedColor);
    setActiveModal(null);
  };

  const handleResetDefault = () => {
    setSelectedColor('default');
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#') && val.length > 0) {
      val = `#${val}`;
    }
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setSelectedColor(val);
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedColor(val);
    setHexInput(val);
  };

  const isDefaultSelected = selectedColor === 'default';

  return (
    <AnimatePresence>
      <motion.div
        key="customize-card-backdrop"
        variants={snappyBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={() => setActiveModal(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[2px]"
      >
        <motion.div
          key="customize-card-modal"
          variants={snappyGelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-white dark:bg-[#111520] border border-slate-200/80 dark:border-[#1E2433] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-[#1A2130] flex-shrink-0">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {language === 'id' ? 'Ubah Warna Kartu' : 'Customize Card Color'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                {language === 'id' ? 'Kartu Total Saldo Tersedia' : 'Main Balance Card'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A2030] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="px-5 py-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
            {/* 1. Live Preview Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-[#8E9BB5] uppercase tracking-wider">
                  {language === 'id' ? 'Pratinjau Langsung' : 'Live Preview'}
                </span>
                {isDefaultSelected && (
                  <span className="text-[10px] bg-slate-100 dark:bg-[#1E2433] text-slate-600 dark:text-[#7B88A6] px-2 py-0.5 rounded-full font-medium">
                    {language === 'id' ? 'Tema Bawaan' : 'System Default'}
                  </span>
                )}
              </div>

              {/* Replica Mini-Card */}
              <div
                className={`relative overflow-hidden rounded-[20px] p-4 text-white shadow-md transition-all duration-300 ${
                  isDefaultSelected
                    ? 'bg-[#0F172A] dark:bg-[#635BFF]'
                    : ''
                }`}
                style={!isDefaultSelected ? { background: selectedColor } : undefined}
              >
                <div className="relative z-10 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/80 font-medium">
                      {language === 'id' ? 'Total Saldo Tersedia' : 'Total Available Balance'}
                    </span>
                    <span className="text-[9px] font-medium text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                      {language === 'id' ? 'Hari ini' : 'Today'}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-bold text-white/80">Rp</span>
                    <span className="text-xl font-extrabold text-white tracking-tight tabular-nums">
                      {Math.abs(Math.round(availableBalance)).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <ArrowDownLeft className="w-3 h-3 text-[#34D399]" />
                      <span className="font-semibold text-white">
                        +{formatCurrency(thisMonthIncome)}
                      </span>
                    </div>
                    <div className="h-3 w-px bg-white/20" />
                    <div className="flex items-center space-x-1.5">
                      <ArrowUpRight className="w-3 h-3 text-red-200" />
                      <span className="font-semibold text-white">
                        -{formatCurrency(thisMonthExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. System Default Button */}
            <button
              type="button"
              onClick={handleResetDefault}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                isDefaultSelected
                  ? 'bg-[#635BFF]/10 dark:bg-[#635BFF]/15 border-[#635BFF] text-[#635BFF] font-semibold shadow-sm'
                  : 'bg-slate-50 dark:bg-[#161B26] border-slate-200 dark:border-[#1E2433] text-slate-700 dark:text-[#A0AEC0] hover:border-slate-300 dark:hover:border-[#2C344A]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {language === 'id' ? 'Warna Tema Sistem (Default)' : 'System Theme Color (Default)'}
                </span>
              </div>
              {isDefaultSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
            </button>

            {/* 3. Solid Color Presets */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-[#8E9BB5] uppercase tracking-wider block mb-2">
                {language === 'id' ? 'Warna Solid Populer' : 'Popular Solid Colors'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SOLID_PRESETS.map((preset) => {
                  const isSelected = selectedColor.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(preset.value);
                        setHexInput(preset.value);
                      }}
                      title={preset.name}
                      className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'scale-105 ring-2 ring-[#635BFF] dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#111520] shadow-md'
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Modern Gradient Presets */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-[#8E9BB5] uppercase tracking-wider block mb-2">
                {language === 'id' ? 'Gradien Modern' : 'Modern Gradients'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((grad) => {
                  const isSelected = selectedColor === grad.value;
                  return (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => setSelectedColor(grad.value)}
                      title={grad.name}
                      className={`h-10 rounded-xl flex items-center justify-center text-white font-medium text-[10px] transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-[#635BFF] dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#111520] shadow-md scale-[1.02]'
                          : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'
                      }`}
                      style={{ background: grad.value }}
                    >
                      <span className="drop-shadow-sm truncate px-1 text-center font-semibold">
                        {grad.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-[#635BFF] flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Custom Color Picker (Pipette + HEX input) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-[#8E9BB5] uppercase tracking-wider block mb-2">
                {language === 'id' ? 'Warna Kustom Sendiri' : 'Custom Color Picker'}
              </label>

              <div className="flex items-center space-x-2">
                {/* Native Color Pipette Trigger */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-300 dark:border-[#2C344A] cursor-pointer shadow-sm relative overflow-hidden"
                    style={{
                      backgroundColor:
                        selectedColor.startsWith('#') && selectedColor.length === 7
                          ? selectedColor
                          : hexInput.startsWith('#') && hexInput.length === 7
                          ? hexInput
                          : '#635BFF',
                    }}
                  >
                    <Pipette className="w-4 h-4 text-white drop-shadow-md stroke-[2.2]" />
                    <input
                      type="color"
                      value={
                        selectedColor.startsWith('#') && selectedColor.length === 7
                          ? selectedColor
                          : '#635BFF'
                      }
                      onChange={handleNativeColorPick}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      title={language === 'id' ? 'Buka pemilih warna' : 'Open color picker'}
                    />
                  </div>
                </div>

                {/* Hex Text Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexChange}
                    placeholder="#635BFF"
                    maxLength={7}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-[#1E2433] rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-sans font-medium">
                    HEX
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#0D1017] border-t border-slate-100 dark:border-[#1A2130] flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#1E2433] text-slate-700 dark:text-[#A0AEC0] hover:bg-slate-100 dark:hover:bg-[#161B26] font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5248EE] text-white font-semibold text-xs shadow-md shadow-[#635BFF]/25 flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{language === 'id' ? 'Terapkan Warna' : 'Apply Color'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
