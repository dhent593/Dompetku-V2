'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  Car,
  Coins,
  TrendingUp,
  Smartphone,
  Package,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils';
import { AssetItem } from '@/types';
import { snappyGelVariants, snappyBackdropVariants } from '@/lib/animationConfig';

export const AssetManagementModal: React.FC = () => {
  const { activeModal, setActiveModal, assets, addAsset, deleteAsset } = useFinance();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetItem['category']>('property');
  const [currentValue, setCurrentValue] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isOpen = activeModal === 'assetManagement';
  if (!isOpen) return null;

  // Calculations
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalPurchasePrice = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalGainLoss = totalCurrentValue - totalPurchasePrice;
  const gainPercent =
    totalPurchasePrice > 0 ? ((totalGainLoss / totalPurchasePrice) * 100).toFixed(1) : '0';

  const categoryIcons: Record<AssetItem['category'], React.ReactNode> = {
    property: <Home className="w-4 h-4" />,
    vehicle: <Car className="w-4 h-4" />,
    precious_metal: <Coins className="w-4 h-4" />,
    investment: <TrendingUp className="w-4 h-4" />,
    electronics: <Smartphone className="w-4 h-4" />,
    other: <Package className="w-4 h-4" />,
  };

  const categoryLabels: Record<AssetItem['category'], { id: string; en: string }> = {
    property: { id: 'Properti', en: 'Property' },
    vehicle: { id: 'Kendaraan', en: 'Vehicle' },
    precious_metal: { id: 'Logam Mulia', en: 'Precious Metal' },
    investment: { id: 'Investasi', en: 'Investment' },
    electronics: { id: 'Elektronik', en: 'Electronics' },
    other: { id: 'Lainnya', en: 'Other' },
  };

  const filteredAssets =
    filterCategory === 'all'
      ? assets
      : assets.filter((a) => a.category === filterCategory);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currVal = parseNumberInput(currentValue);
    const purPrice = parseNumberInput(purchasePrice);

    if (!name.trim() || isNaN(currVal) || currVal <= 0) {
      setFormError(language === 'id' ? 'Nama aset dan nilai saat ini wajib diisi' : 'Name and current value are required');
      return;
    }

    addAsset({
      name: name.trim(),
      category,
      currentValue: currVal,
      purchasePrice: !isNaN(purPrice) && purPrice > 0 ? purPrice : currVal,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    setName('');
    setCurrentValue('');
    setPurchasePrice('');
    setPurchaseDate('');
    setNotes('');
    setFormError(null);
    setActiveTab('list');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="asset-backdrop"
        variants={snappyBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={() => setActiveModal(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          key="asset-modal"
          variants={snappyGelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#141824] p-6 shadow-2xl text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'id' ? 'Pencatatan Aset & Kekayaan' : 'Asset Management'}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-[#7B88A6]">
                  {language === 'id' ? 'Pantau portofolio aset & nilai kekayaan bersih' : 'Track net assets & capital growth'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] dark:hover:bg-[#252E44] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Summary Banner */}
          <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#111520] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] font-medium block">
                {language === 'id' ? 'Total Nilai Aset' : 'Total Asset Value'}
              </span>
              <span className="text-xl font-black text-[#635BFF] tracking-tight">
                {formatCurrency(totalCurrentValue)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] font-medium block">
                {language === 'id' ? 'Pertumbuhan Nilai' : 'Capital Gain'}
              </span>
              <div className="flex items-center justify-end space-x-1">
                {totalGainLoss >= 0 ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-[#10B981] flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{gainPercent}%
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-500 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{gainPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-[#111520] p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-[#1C2233] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Daftar Aset' : 'Asset List'} ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-white dark:bg-[#1C2233] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#7B88A6] dark:hover:text-white'
              }`}
            >
              + {language === 'id' ? 'Tambah Aset' : 'Add Asset'}
            </button>
          </div>

          {activeTab === 'list' ? (
            /* VIEW 1: ASSET LIST */
            <div className="flex flex-col space-y-3">
              {/* Category Filter Pills */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`text-[11px] py-1 px-2.5 rounded-full font-semibold transition-all flex-shrink-0 cursor-pointer ${
                    filterCategory === 'all'
                      ? 'bg-[#635BFF] !text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className={filterCategory === 'all' ? '!text-white' : ''}>
                    {language === 'id' ? 'Semua' : 'All'}
                  </span>
                </button>
                {(['property', 'vehicle', 'precious_metal', 'investment', 'electronics'] as AssetItem['category'][]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`text-[11px] py-1 px-2.5 rounded-full font-semibold transition-all flex-shrink-0 cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-[#635BFF] !text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2233] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className={filterCategory === cat ? '!text-white' : ''}>
                        {categoryLabels[cat][language === 'id' ? 'id' : 'en']}
                      </span>
                    </button>
                  )
                )}
              </div>

              {filteredAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'id' ? 'Belum ada aset dalam kategori ini.' : 'No assets in this category.'}
                  </p>
                </div>
              ) : (
                filteredAssets.map((ast) => {
                  const gain = ast.currentValue - ast.purchasePrice;
                  const pct =
                    ast.purchasePrice > 0 ? ((gain / ast.purchasePrice) * 100).toFixed(1) : '0';

                  return (
                    <div
                      key={ast.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#141824] shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1C2233] flex items-center justify-center text-[#635BFF] flex-shrink-0">
                          {categoryIcons[ast.category]}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ast.name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-[#7B88A6] block">
                            {categoryLabels[ast.category][language === 'id' ? 'id' : 'en']}{' '}
                            {ast.purchaseDate && `• ${ast.purchaseDate}`}
                          </span>
                          {ast.notes && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {ast.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                            {formatCurrency(ast.currentValue)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              gain >= 0
                                ? 'text-emerald-600 dark:text-[#10B981]'
                                : 'text-red-500'
                            }`}
                          >
                            {gain >= 0 ? `+${pct}%` : `${pct}%`}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteAsset(ast.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* VIEW 2: ADD ASSET FORM */
            <form onSubmit={handleAddSubmit} className="flex flex-col space-y-3 pt-1">
              {formError && (
                <div className="text-xs p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Nama Aset' : 'Asset Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rumah Tinggal, Emas Antam 25gr, Mobil Innova"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Kategori Aset' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssetItem['category'])}
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                >
                  {(['property', 'vehicle', 'precious_metal', 'investment', 'electronics', 'other'] as AssetItem['category'][]).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat][language === 'id' ? 'id' : 'en']}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Nilai Saat Ini (Rp)' : 'Current Value (Rp)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(formatNumberInput(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                    {language === 'id' ? 'Harga Beli (Rp)' : 'Purchase Price (Rp)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(formatNumberInput(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Tanggal Pembelian / Perolehan' : 'Purchase Date'}
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#7B88A6] font-medium block mb-1">
                  {language === 'id' ? 'Catatan Tambahan' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sertifikat SHM No. 1234, Plat Nomor B 1234 CD"
                  className="w-full bg-slate-50 dark:bg-[#1C2233] border border-slate-200 dark:border-[#273047] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#564EE6] !text-white text-xs font-bold tracking-wide active:scale-95 transition-all mt-2 cursor-pointer shadow-sm"
              >
                <span className="!text-white font-bold">
                  {language === 'id' ? 'Simpan Data Aset' : 'Save Asset Record'}
                </span>
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
