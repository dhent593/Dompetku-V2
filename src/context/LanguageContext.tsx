'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

const translations = {
  id: {
    // Nav
    nav_home: 'Beranda',
    nav_analytics: 'Analisis',
    nav_wallet: 'Dompet',
    nav_settings: 'Pengaturan',

    // Home
    welcome_back: 'Selamat datang kembali',
    total_balance_available: 'Total Saldo Tersedia',
    monthly_income: 'Pemasukan Bulan Ini',
    monthly_expense: 'Pengeluaran Bulan Ini',
    transfer: 'Transfer',
    scan_qr: 'Pindai QR',
    transactions: 'Transaksi',
    see_all: 'Lihat semua',
    today: 'HARI INI',
    yesterday: 'KEMARIN',
    earlier_this_week: 'AWAL MINGGU INI',
    older: 'TERDAHULU',

    // Analytics
    total_balance: 'Total Saldo',
    withdraw: 'Tarik Dana',
    expenses: 'Pengeluaran',
    savings: 'Tabungan',
    history: 'Riwayat Kategori',
    monthly: 'Bulanan',
    weekly: 'Mingguan',
    yearly: 'Tahunan',
    travel: 'Perjalanan',
    investment: 'Investasi',
    food: 'Makanan',
    shopping: 'Belanja',
    bill: 'Tagihan',
    salary: 'Gaji',

    // Wallet
    unlock_fingerprint: 'Buka dengan sidik jari',
    or: 'atau',
    enter_mpin: 'Masukkan 4 Digit Login mPIN',
    tap_fingerprint: 'Sentuh sidik jari untuk masuk cepat',
    not_you: 'Bukan Anda?',
    forgot_pin: 'Lupa PIN?',
    products: 'Layanan & Produk',
    tap_to_pay: 'Bayar Instan',
    credit_cards: 'Kartu Kredit',
    mobile_banking: 'Mobile Banking',
    loans: 'Pinjaman',
    fund_transfer: 'Transfer Dana',
    demo_pin_hint: 'PIN Demo: 1234',
    clear: 'Hapus',

    // Settings
    settings_title: 'Pengaturan',
    account_security: 'Keamanan Akun',
    light_dark_mode: 'Mode Terang / Gelap',
    language_setting: 'Bahasa / Language',
    payment_methods: 'Metode Pembayaran',
    help_support: 'Bantuan & Dukungan',
    log_out: 'Keluar Akun',
    logout_confirm_title: 'Apakah Anda yakin ingin keluar?',
    logout_confirm_desc: 'Anda perlu masuk kembali atau menggunakan mPIN untuk mengakses MyPocket.',
    yes_logout: 'Ya, Keluar',
    cancel: 'Batal',

    // Transactions list
    tx_title: 'Daftar Transaksi',
    search_tx: 'Cari transaksi...',
    add_custom_tx: 'Tambah Catatan Transaksi',
    no_tx_found: 'Tidak ada transaksi yang cocok.',

    // Modals
    transfer_title: 'Transfer Saldo',
    recipient_label: 'Nama atau Rekening Penerima',
    amount_label: 'Nominal ($)',
    available_label: 'Tersedia',
    note_label: 'Catatan (Opsional)',
    confirm_transfer: 'Konfirmasi Transfer',
    transfer_success: 'Transfer Berhasil!',

    withdraw_title: 'Tarik Dana',
    dest_account: 'Rekening Tujuan',
    confirm_withdraw: 'Konfirmasi Penarikan',
    withdraw_success: 'Penarikan Berhasil Diproses!',

    scan_title: 'Pindai Kode QR',
    scan_subtitle: 'Arahkan kamera ke kode QR merchant',
    simulate_scan: 'Simulasikan Pembayaran QR ($8.50)',

    new_record: 'Catatan Baru',
    expense_type: 'Pengeluaran (-)',
    income_type: 'Pemasukan (+)',
    title_label: 'Judul Transaksi',
    category_label: 'Kategori',
    save_tx: 'Simpan Transaksi',

    edit_tx: 'Edit Transaksi',
    tx_details: 'Rincian Transaksi',
    date_time: 'Tanggal & Waktu',
    card_used: 'Kartu Digunakan',
    delete_tx: 'Hapus Transaksi',
    delete_confirm_title: 'Hapus transaksi ini?',
    delete_confirm_desc: 'Saldo Anda akan otomatis disesuaikan.',
    yes_delete: 'Ya, Hapus',
    save_changes: 'Simpan Perubahan',

    edit_profile: 'Ubah Profil',
    display_name: 'Nama Tampilan',
    email_label: 'Alamat Email',
    profile_updated: 'Profil Berhasil Diperbarui!',
    numeric_keypad: 'Papan Tombol Numerik',
    hide: 'Sembunyikan',
    other: 'Lainnya',
    transfer_amount_sent: 'Telah ditransfer',
    to_recipient: 'ke',
    withdrawal_to: 'dikirim ke',
    qr_paid_to: 'Berhasil membayar',

    saved_cards: 'Kartu Tersimpan',
    add_card: 'Tambah Kartu',
    card_number: 'Nomor Kartu',
    card_holder: 'Nama Pemilik Kartu',
    expiry: 'Masa Berlaku',
    card_brand: 'Tipe Kartu',
    set_default: 'Jadikan Utama',
    primary_badge: 'Utama',

    change_mpin: 'Ubah 4-Digit Login mPIN',
    current_mpin: 'mPIN Saat Ini',
    new_mpin: 'mPIN Baru',
    confirm_mpin: 'Konfirmasi mPIN',
    biometric_unlock: 'Buka Kunci Biometrik',
    biometric_desc: 'Akses cepat dengan sidik jari',
    update_mpin_btn: 'Perbarui mPIN',

    // Login
    welcome_sub: 'Pencatatan keuangan modern & aman',
    email_login_tab: 'Masuk Email',
    mpin_login_tab: 'mPIN / Biometrik',
    password_label: 'Kata Sandi',
    sign_in_btn: 'Masuk ke MyPocket',
    instant_demo: 'Akses Demo Instan (Smith)',
    dont_have_account: 'Belum punya akun?',
    create_account: 'Daftar Baru',
    full_name: 'Nama Lengkap',
    complete_reg: 'Selesaikan Pendaftaran',
    already_registered: 'Sudah punya akun?',
  },
  en: {
    // Nav
    nav_home: 'Home',
    nav_analytics: 'Analytics',
    nav_wallet: 'Wallet',
    nav_settings: 'Settings',

    // Home
    welcome_back: 'Welcome back',
    total_balance_available: 'Total Available Balance',
    monthly_income: 'Monthly Income',
    monthly_expense: 'Monthly Expenses',
    transfer: 'Transfer',
    scan_qr: 'Scan QR',
    transactions: 'Transactions',
    see_all: 'See all',
    today: 'TODAY',
    yesterday: 'YESTERDAY',
    earlier_this_week: 'EARLIER THIS WEEK',
    older: 'OLDER',

    // Analytics
    total_balance: 'Total Balance',
    withdraw: 'Withdraw',
    expenses: 'Expenses',
    savings: 'Savings',
    history: 'History',
    monthly: 'Monthly',
    weekly: 'Weekly',
    yearly: 'Yearly',
    travel: 'Travel',
    investment: 'Investment',
    food: 'Food',
    shopping: 'Shopping',
    bill: 'Bill',
    salary: 'Salary',

    // Wallet
    unlock_fingerprint: 'Unlock with fingerprint',
    or: 'or',
    enter_mpin: 'Enter 4 Digit Login mPIN',
    tap_fingerprint: 'Tap fingerprint to quick login',
    not_you: 'Not you?',
    forgot_pin: 'Forgot PIN?',
    products: 'Products',
    tap_to_pay: 'Tap to pay',
    credit_cards: 'Credit cards',
    mobile_banking: 'Mobile banking',
    loans: 'Loans',
    fund_transfer: 'Fund transfer',
    demo_pin_hint: 'Demo PIN: 1234',
    clear: 'Clear',

    // Settings
    settings_title: 'Settings',
    account_security: 'Account Security',
    light_dark_mode: 'Light / Dark Mode',
    language_setting: 'Language / Bahasa',
    payment_methods: 'Payment Methods',
    help_support: 'Help & Support',
    log_out: 'Log Out',
    logout_confirm_title: 'Are you sure you want to log out?',
    logout_confirm_desc: 'You will need to sign in or enter your mPIN to access MyPocket again.',
    yes_logout: 'Yes, Log Out',
    cancel: 'Cancel',

    // Transactions list
    tx_title: 'Transactions',
    search_tx: 'Search transactions...',
    add_custom_tx: 'Add Custom Transaction',
    no_tx_found: 'No transactions found matching your criteria.',

    // Modals
    transfer_title: 'Transfer Money',
    recipient_label: 'Recipient Name or Account',
    amount_label: 'Amount ($)',
    available_label: 'Avail',
    note_label: 'Note (Optional)',
    confirm_transfer: 'Confirm Transfer',
    transfer_success: 'Transfer Successful!',

    withdraw_title: 'Withdraw Funds',
    dest_account: 'Destination Account',
    confirm_withdraw: 'Confirm Withdrawal',
    withdraw_success: 'Withdrawal Processed!',

    scan_title: 'Scan QR Code',
    scan_subtitle: 'Align the QR code within the viewfinder frame',
    simulate_scan: 'Simulate Scan Payment ($8.50)',

    new_record: 'New Record',
    expense_type: 'Expense (-)',
    income_type: 'Income (+)',
    title_label: 'Title',
    category_label: 'Category',
    save_tx: 'Save Transaction',

    edit_tx: 'Edit Transaction',
    tx_details: 'Transaction Details',
    date_time: 'Date & Time',
    card_used: 'Card Used',
    delete_tx: 'Delete',
    delete_confirm_title: 'Delete this transaction?',
    delete_confirm_desc: 'Your balance will automatically adjust accordingly.',
    yes_delete: 'Yes, Delete',
    save_changes: 'Save Changes',

    edit_profile: 'Edit Profile',
    display_name: 'Display Name',
    email_label: 'Email Address',
    profile_updated: 'Profile Updated Successfully!',
    numeric_keypad: 'Numeric Keypad',
    hide: 'Hide',
    other: 'Other',
    transfer_amount_sent: 'Transferred',
    to_recipient: 'to',
    withdrawal_to: 'sent to',
    qr_paid_to: 'Paid',

    saved_cards: 'Saved Cards',
    add_card: 'Add Card',
    card_number: 'Card Number',
    card_holder: 'Cardholder Name',
    expiry: 'Expiry (MM/YY)',
    card_brand: 'Card Brand',
    set_default: 'Set Default',
    primary_badge: 'Primary',

    change_mpin: 'Change 4-Digit Login mPIN',
    current_mpin: 'Current mPIN',
    new_mpin: 'New PIN',
    confirm_mpin: 'Confirm PIN',
    biometric_unlock: 'Biometric Unlock',
    biometric_desc: 'Quick access with fingerprint',
    update_mpin_btn: 'Update mPIN',

    // Login
    welcome_sub: 'Smart, clean personal finance management',
    email_login_tab: 'Email Login',
    mpin_login_tab: 'mPIN / Biometric',
    password_label: 'Password',
    sign_in_btn: 'Sign In',
    instant_demo: 'Instant Demo Access (Smith)',
    dont_have_account: "Don't have an account?",
    create_account: 'Create Account',
    full_name: 'Full Name',
    complete_reg: 'Complete Registration',
    already_registered: 'Already registered?',
  },
};

export type TranslationKey = keyof typeof translations.id;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mypocket_lang_v1') as Language | null;
      if (stored === 'id' || stored === 'en') {
        setLanguageState(stored);
      }
    } catch {
      // fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mypocket_lang_v1', lang);
    } catch {
      // fallback
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.id[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
