'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Wallet,
  Landmark,
  Plane,
  Smartphone,
  Heart,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  ArrowRightLeft,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Check,
  Pipette,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { POCKET_COLOR_PRESETS } from '@/lib/dummyData';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

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

export const PocketDetailModal: React.FC = () => {
  const {
    selectedPocket,
    setSelectedPocket,
    pockets,
    updatePocket,
    deletePocket,
    transferBetweenPockets,
  } = useFinance();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'view' | 'transfer' | 'edit'>('view');
  const [targetPocketId, setTargetPocketId] = useState<string>('');
  const [amountInput, setAmountInput] = useState('');
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editColor, setEditColor] = useState('#635BFF');
  const [editIcon, setEditIcon] = useState('Shield');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (selectedPocket) {
      setEditName(selectedPocket.name);
      setEditTarget(selectedPocket.targetAmount.toString());
      setEditColor(selectedPocket.color);
      setEditIcon(selectedPocket.iconName || 'Shield');
      setMode('view');
      setShowDeleteConfirm(false);
      setFeedbackMsg(null);
      setAmountInput('');
      const other = pockets.filter((p) => p.id !== selectedPocket.id);
      if (other.length > 0) {
        setTargetPocketId(other[0].id);
      }
    }
  }, [selectedPocket, pockets]);

  if (!selectedPocket) return null;

  const progressPercent = Math.min(
    100,
    Math.round((selectedPocket.balance / selectedPocket.targetAmount) * 100) || 0
  );

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Wallet':
        return <Wallet className="w-5 h-5" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5" />;
      case 'Plane':
        return <Plane className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const otherPockets = pockets.filter((p) => p.id !== selectedPocket.id);

  const handleTransferFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      setFeedbackMsg({ text: 'Masukkan nominal yang valid', isError: true });
      return;
    }
    if (num > selectedPocket.balance) {
      setFeedbackMsg({
        text: `${t('insufficient_pocket_balance')} (${formatCurrency(selectedPocket.balance)})`,
        isError: true,
      });
      return;
    }
    if (!targetPocketId) {
      setFeedbackMsg({ text: t('dest_pocket_label'), isError: true });
      return;
    }

    const targetPocket = pockets.find((p) => p.id === targetPocketId);
    const success = transferBetweenPockets(selectedPocket.id, targetPocketId, num);
    if (success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setFeedbackMsg({
        text: `Berhasil memindahkan ${formatCurrency(num)} ke ${targetPocket?.name || 'kantong tujuan'}!`,
        isError: false,
      });
      setTimeout(() => {
        setAmountInput('');
        setMode('view');
        setFeedbackMsg(null);
      }, 1200);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(editTarget);
    if (!editName.trim() || isNaN(targetNum) || targetNum <= 0) {
      setFeedbackMsg({ text: 'Lengkapi nama dan target saldo yang valid', isError: true });
      return;
    }

    updatePocket(selectedPocket.id, {
      name: editName.trim(),
      targetAmount: targetNum,
      color: editColor,
      iconName: editIcon,
    });

    setFeedbackMsg({ text: t('pocket_updated'), isError: false });
    setTimeout(() => {
      setMode('view');
      setFeedbackMsg(null);
    }, 1000);
  };

  const handleDelete = () => {
    deletePocket(selectedPocket.id);
    setSelectedPocket(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="pocketdetail-backdrop"
        variants={snappyBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          key="pocketdetail-modal"
          variants={snappyGelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-sm rounded-[24px] bg-[#141824] border border-[#1E2435] p-6 shadow-2xl text-white relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2435]">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: selectedPocket.color }}
              >
                {renderIcon(selectedPocket.iconName)}
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">{selectedPocket.name}</h3>
                <span className="text-[11px] text-[#7B88A6]">{t('pocket_details_title')}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPocket(null)}
              className="w-8 h-8 rounded-full bg-[#1C2233] flex items-center justify-center text-[#7B88A6] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Message */}
          {feedbackMsg && (
            <div
              className={`text-xs p-2.5 rounded-xl border mt-3 flex items-center space-x-2 ${
                feedbackMsg.isError
                  ? 'text-red-400 bg-red-950/40 border-red-900/50'
                  : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* VIEW MODE */}
          {mode === 'view' && (
            <div className="flex flex-col space-y-4 pt-4">
              {/* Balance & Goal Card */}
              <div className="p-4 rounded-2xl bg-[#111520] border border-[#1B2130]">
                <div className="flex items-center justify-between text-xs text-[#7B88A6] mb-1">
                  <span>{t('collected_label')}</span>
                  <span>
                    {progressPercent}% {t('pocket_target_label')}
                  </span>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {formatCurrency(selectedPocket.balance)}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#1E2435] mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: selectedPocket.color }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#7B88A6] mt-2">
                  <span>Rp0</span>
                  <span>
                    {t('pocket_target_label')}: {formatCurrency(selectedPocket.targetAmount)}
                  </span>
                </div>
              </div>

              {/* Action Button: Pindah Dana */}
              <button
                onClick={() => {
                  const other = pockets.filter((p) => p.id !== selectedPocket.id);
                  if (other.length > 0) {
                    setTargetPocketId(other[0].id);
                  }
                  setMode('transfer');
                  setAmountInput('');
                  setFeedbackMsg(null);
                }}
                className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-xl bg-[#1C2233] border border-[#273047] hover:border-[#635BFF] hover:bg-[#202738] text-white text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-sm group"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#635BFF] group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="tracking-wide">{t('move_funds_pocket')}</span>
              </button>

              {/* Bottom Actions: Edit & Delete */}
              {showDeleteConfirm ? (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 flex flex-col space-y-2 mt-1">
                  <div className="flex items-center space-x-2 text-xs text-red-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{t('delete_pocket_confirm_title')}</span>
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-snug">
                    {t('delete_pocket_confirm_desc')}
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {t('yes_delete')}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => {
                      setMode('edit');
                      setFeedbackMsg(null);
                    }}
                    className="flex items-center space-x-1.5 text-[#7B88A6] hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('edit_pocket')}</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer py-1.5 px-2 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete_pocket')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PINDAH DANA FORM */}
          {mode === 'transfer' && (
            <div className="flex flex-col space-y-4 pt-4">
              <div className="flex items-center space-x-2 text-xs text-[#7B88A6] font-medium border-b border-[#1E2435] pb-2.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>{t('move_funds_title')}</span>
              </div>

              {otherPockets.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#111520] border border-[#1E2435] text-center flex flex-col items-center space-y-3">
                  <p className="text-xs text-[#7B88A6] leading-relaxed">
                    {t('no_other_pockets')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('view');
                      setFeedbackMsg(null);
                    }}
                    className="py-2 px-4 rounded-xl bg-[#1C2233] text-white text-xs font-semibold hover:bg-[#242D42] cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTransferFunds} className="flex flex-col space-y-3.5">
                  {/* Select Destination Pocket */}
                  <div>
                    <label className="text-xs text-[#7B88A6] font-medium block mb-2">
                      {t('dest_pocket_label')}
                    </label>
                    <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto pr-0.5">
                      {otherPockets.map((p) => {
                        const isTarget = targetPocketId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setTargetPocketId(p.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isTarget
                                ? 'bg-[#1C2233] border-[#635BFF] ring-1 ring-[#635BFF]'
                                : 'bg-[#111520] border-[#1E2435] hover:border-[#2D364D]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                style={{ backgroundColor: p.color }}
                              >
                                {renderIcon(p.iconName)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-white tracking-tight">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-[#7B88A6]">
                                  {t('collected_label')}: {formatCurrency(p.balance)}
                                </p>
                              </div>
                            </div>
                            {isTarget && (
                              <div className="w-5 h-5 rounded-full bg-[#635BFF] flex items-center justify-center text-white">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transfer Amount Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#7B88A6] font-medium">
                        {t('amount_label')}
                      </label>
                      <span className="text-[11px] text-[#7B88A6]">
                        {t('available_label')}: {formatCurrency(selectedPocket.balance)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max={selectedPocket.balance}
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#635BFF]"
                      autoFocus
                      required
                    />

                    {/* Quick Percentage Chips */}
                    <div className="flex items-center space-x-1.5 mt-2">
                      {[0.25, 0.5, 0.75].map((fraction) => {
                        const calculated = Math.floor(selectedPocket.balance * fraction);
                        return (
                          <button
                            key={fraction}
                            type="button"
                            onClick={() =>
                              setAmountInput(calculated > 0 ? calculated.toString() : '0')
                            }
                            className="flex-1 text-[11px] font-medium py-1 px-1.5 rounded-lg bg-[#1C2233] border border-[#273047] text-[#8E9BB8] hover:text-white hover:border-[#635BFF] cursor-pointer text-center"
                          >
                            {fraction * 100}%
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setAmountInput(selectedPocket.balance.toString())}
                        className="flex-1 text-[11px] font-semibold py-1 px-1.5 rounded-lg bg-[#1C2233] border border-[#273047] text-[#635BFF] hover:text-white hover:bg-[#635BFF] hover:border-[#635BFF] cursor-pointer text-center transition-colors"
                      >
                        {t('all_balance')}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="submit"
                      disabled={selectedPocket.balance <= 0}
                      className={`flex-1 py-3 rounded-xl text-white text-xs font-bold transition-all ${
                        selectedPocket.balance > 0
                          ? 'bg-[#635BFF] hover:bg-[#564EE6] cursor-pointer shadow-sm active:scale-95'
                          : 'bg-[#273047] text-white/50 cursor-not-allowed'
                      }`}
                    >
                      {t('confirm_move_funds')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('view');
                        setFeedbackMsg(null);
                      }}
                      className="py-3 px-4 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* EDIT FORM */}
          {mode === 'edit' && (
            <form onSubmit={handleSaveEdit} className="flex flex-col space-y-3.5 pt-4">
              <div>
                <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">
                  {t('pocket_name_label')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#635BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7B88A6] font-medium block mb-1">
                  {t('pocket_target_input')}
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="w-full bg-[#1C2233] border border-[#273047] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#635BFF]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-[#7B88A6] font-medium">
                    {t('pocket_color_label')}
                  </label>
                  <div className="flex items-center space-x-1.5 bg-[#1C2233] px-2 py-0.5 rounded-lg border border-[#273047]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: editColor }}
                    />
                    <span className="text-[11px] font-mono text-white/90 uppercase font-semibold">
                      {editColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  {POCKET_COLOR_PRESETS.map((preset) => {
                    const isSelected = editColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditColor(preset.hex)}
                        title={preset.name}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-[#141824]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}

                  {/* Custom Color Button with Native Color Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      title={t('custom_color')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                        !POCKET_COLOR_PRESETS.some(
                          (p) => p.hex.toLowerCase() === editColor.toLowerCase()
                        )
                          ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-[#141824]'
                          : 'border border-dashed border-[#3E4A68] hover:border-white/60 bg-[#1C2233]'
                      }`}
                      style={{
                        backgroundColor: !POCKET_COLOR_PRESETS.some(
                          (p) => p.hex.toLowerCase() === editColor.toLowerCase()
                        )
                          ? editColor
                          : undefined,
                      }}
                    >
                      {!POCKET_COLOR_PRESETS.some(
                        (p) => p.hex.toLowerCase() === editColor.toLowerCase()
                      ) ? (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" />
                      ) : (
                        <Pipette className="w-3 h-3 text-[#A0AEC0] hover:text-white transition-colors" />
                      )}
                      <input
                        type="color"
                        value={
                          editColor.startsWith('#') && editColor.length === 7
                            ? editColor
                            : '#8B5CF6'
                        }
                        onChange={(e) => setEditColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        title={t('custom_color')}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-[11px] text-[#7B88A6] font-medium block mb-1.5">
                  {t('pocket_icon_label')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = editIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEditIcon(item.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C2233] text-white border-white/40 shadow-sm'
                            : 'bg-[#141824] border-[#1E2435] text-[#7B88A6] hover:text-white hover:border-[#2A344A]'
                        }`}
                        title={item.label}
                      >
                        <IconComp
                          className="w-4 h-4 stroke-[2]"
                          style={{ color: isSelected ? editColor : undefined }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {t('save_changes')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="py-3 px-4 rounded-xl bg-[#1C2233] text-[#7B88A6] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

