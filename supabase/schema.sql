-- ========================================================
-- MyPocket - Supabase Database Schema
-- Version: 1.0.0
-- Description: Production-ready schema for MyPocket personal finance app,
--              including Row Level Security (RLS), auto-triggers,
--              indexes, and automatic profile + default pockets provisioning.
-- ========================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 2. TABLES DEFINITION
-- ========================================================

-- 2.1 PROFILES (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Smith',
    email TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    card_number_mask TEXT DEFAULT '.... 3245',
    card_expiry TEXT DEFAULT '08/30',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_online BOOLEAN NOT NULL DEFAULT true,
    biometric_enabled BOOLEAN NOT NULL DEFAULT true,
    mpin_hash TEXT DEFAULT '1234',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 POCKETS (Kelola Kantong Keuangan)
CREATE TABLE IF NOT EXISTS public.pockets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#635BFF',
    icon_name TEXT NOT NULL DEFAULT 'WalletCards',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 PAYMENT CARDS & BANK ACCOUNTS (Nomor Rekening & Kartu Bank)
CREATE TABLE IF NOT EXISTS public.payment_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    card_holder TEXT NOT NULL,
    card_number_mask TEXT DEFAULT '.... 3245',
    card_expiry TEXT DEFAULT '08/30',
    brand TEXT NOT NULL DEFAULT 'visa',
    is_default BOOLEAN NOT NULL DEFAULT false,
    color_gradient TEXT DEFAULT 'from-blue-900 to-indigo-950',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 TRANSACTIONS (Pencatatan Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'shopping', 'bill', 'salary', 'travel', 'investment', 
        'food', 'entertainment', 'transfer', 'other'
    )),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    date_group TEXT DEFAULT 'TODAY',
    time TEXT DEFAULT '12:00 PM',
    timestamp BIGINT,
    icon_name TEXT,
    card_number TEXT,
    recipient TEXT,
    note TEXT,
    pocket_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 DEBTS & LOANS (Catatan Hutang & Pinjaman)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lender TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    remaining_amount NUMERIC(15, 2) NOT NULL CHECK (remaining_amount >= 0),
    due_date DATE NOT NULL,
    installment_count INTEGER DEFAULT 12,
    paid_installments INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('active', 'paid_off', 'overdue')) DEFAULT 'active',
    reminder_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.6 DEBT PAYMENT HISTORY (Riwayat Pembayaran Cicilan Hutang)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    pocket_name TEXT NOT NULL DEFAULT 'Saldo Utama',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 ASSETS & PORTFOLIO (Portofolio Aset & Investasi)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'property', 'vehicle', 'precious_metal', 'investment', 'electronics', 'other'
    )),
    current_value NUMERIC(15, 2) NOT NULL CHECK (current_value >= 0),
    purchase_price NUMERIC(15, 2) NOT NULL CHECK (purchase_price >= 0),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 CATEGORY BUDGETS (Budget Bulanan per Kategori)
CREATE TABLE IF NOT EXISTS public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

-- 2.9 FINANCIAL NOTES (Catatan Keuangan)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    tag TEXT DEFAULT 'Umum',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.10 WISHLIST (Daftar Barang Impian)
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pocket_id UUID REFERENCES public.pockets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    estimated_price NUMERIC(15, 2) NOT NULL CHECK (estimated_price >= 0),
    saved_amount NUMERIC(15, 2) DEFAULT 0 CHECK (saved_amount >= 0),
    target_date DATE,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('planned', 'saved', 'purchased')) DEFAULT 'planned',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_pockets_user_id ON public.pockets(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON public.payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON public.debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id ON public.category_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);

-- ========================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 4.2 Pockets Policies
CREATE POLICY "Users can view own pockets" 
    ON public.pockets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pockets" 
    ON public.pockets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pockets" 
    ON public.pockets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pockets" 
    ON public.pockets FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.3 Payment Cards Policies
CREATE POLICY "Users can view own payment cards" 
    ON public.payment_cards FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment cards" 
    ON public.payment_cards FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment cards" 
    ON public.payment_cards FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment cards" 
    ON public.payment_cards FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.4 Transactions Policies
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
    ON public.transactions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
    ON public.transactions FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.5 Debts Policies
CREATE POLICY "Users can view own debts" 
    ON public.debts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts" 
    ON public.debts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" 
    ON public.debts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" 
    ON public.debts FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.6 Debt Payments Policies
CREATE POLICY "Users can view own debt payments" 
    ON public.debt_payments FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debt payments" 
    ON public.debt_payments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debt payments" 
    ON public.debt_payments FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.7 Assets Policies
CREATE POLICY "Users can view own assets" 
    ON public.assets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" 
    ON public.assets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" 
    ON public.assets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" 
    ON public.assets FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.8 Budgets Policies
CREATE POLICY "Users can view own budgets" 
    ON public.category_budgets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
    ON public.category_budgets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
    ON public.category_budgets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
    ON public.category_budgets FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.9 Notes Policies
CREATE POLICY "Users can view own notes" 
    ON public.notes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" 
    ON public.notes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" 
    ON public.notes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" 
    ON public.notes FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.10 Wishlists Policies
CREATE POLICY "Users can view own wishlists" 
    ON public.wishlists FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists" 
    ON public.wishlists FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists" 
    ON public.wishlists FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists" 
    ON public.wishlists FOR DELETE 
    USING (auth.uid() = user_id);

-- ========================================================
-- 5. AUTOMATIC TRIGGERS & FUNCTIONS
-- ========================================================

-- 5.1 Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_pockets_updated_at ON public.pockets;
CREATE TRIGGER set_pockets_updated_at
    BEFORE UPDATE ON public.pockets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payment_cards_updated_at ON public.payment_cards;
CREATE TRIGGER set_payment_cards_updated_at
    BEFORE UPDATE ON public.payment_cards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_debts_updated_at ON public.debts;
CREATE TRIGGER set_debts_updated_at
    BEFORE UPDATE ON public.debts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_assets_updated_at ON public.assets;
CREATE TRIGGER set_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.category_budgets;
CREATE TRIGGER set_budgets_updated_at
    BEFORE UPDATE ON public.category_budgets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_wishlists_updated_at ON public.wishlists;
CREATE TRIGGER set_wishlists_updated_at
    BEFORE UPDATE ON public.wishlists
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.2 Auto Provision New User Profile & Default Starter Pockets on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Insert Profile
    INSERT INTO public.profiles (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')
    );

    -- 2. Provision Default Starter Pockets (Mandiri, BRI, ShoppePay)
    INSERT INTO public.pockets (user_id, name, balance, target_amount, color, icon_name)
    VALUES 
        (NEW.id, 'Mandiri', 9783125, 10000000, '#635BFF', 'WalletCards'),
        (NEW.id, 'BRI', 2800, 8000, '#0284C7', 'Building2'),
        (NEW.id, 'ShoppePay', 3575, 5000, '#EA580C', 'Smartphone');

    -- 3. Provision Default Starter Category Budgets
    INSERT INTO public.category_budgets (user_id, category, monthly_limit)
    VALUES
        (NEW.id, 'shopping', 500000),
        (NEW.id, 'bill', 300000),
        (NEW.id, 'food', 600000);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute handle_new_user on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
