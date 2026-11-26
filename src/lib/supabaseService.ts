import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  Transaction, 
  UserProfile, 
  PaymentCard, 
  Pocket, 
  DebtItem, 
  DebtPaymentRecord, 
  AssetItem, 
  CategoryBudget, 
  NoteItem, 
  WishlistItem 
} from '@/types';

export class SupabaseService {
  /**
   * Check whether Supabase is properly configured via environment variables
   */
  static isConfigured(): boolean {
    return isSupabaseConfigured;
  }

  // ========================================================
  // 1. USER PROFILE
  // ========================================================
  static async getProfile(): Promise<UserProfile | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    const isDemo = (data.email || user.email) === 'smith@example.com';
    const hasExplicitPin = isDemo || Boolean(data.pin_created || (data.mpin_hash && data.mpin_hash !== '1234'));

    return {
      id: data.id,
      name: data.name,
      email: data.email || user.email || '',
      avatarUrl: data.avatar_url,
      cardNumberMask: data.card_number_mask,
      cardExpiry: data.card_expiry,
      balance: Number(data.balance),
      totalBalance: Number(data.total_balance),
      isOnline: data.is_online,
      biometricEnabled: Boolean(data.biometric_enabled),
      pinEnabled: isDemo ? Boolean(data.pin_enabled ?? true) : Boolean(data.pin_enabled && hasExplicitPin),
      pinCreated: hasExplicitPin,
      mPinHash: isDemo ? '1234' : (hasExplicitPin ? data.mpin_hash : ''),
    };
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.biometricEnabled !== undefined) payload.biometric_enabled = updates.biometricEnabled;
    if (updates.pinEnabled !== undefined) payload.pin_enabled = updates.pinEnabled;
    if (updates.pinCreated !== undefined) payload.pin_created = updates.pinCreated;
    if (updates.mPinHash !== undefined) payload.mpin_hash = updates.mPinHash;
    if (updates.balance !== undefined) payload.balance = updates.balance;
    if (updates.totalBalance !== undefined) payload.total_balance = updates.totalBalance;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    return !error;
  }

  // ========================================================
  // 2. POCKETS (KELOLA KANTONG)
  // ========================================================
  static async getPockets(): Promise<Pocket[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('pockets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      balance: Number(p.balance),
      targetAmount: Number(p.target_amount),
      color: p.color,
      iconName: p.icon_name,
      createdAt: new Date(p.created_at).getTime(),
      isAsset: Boolean(p.is_asset),
    }));
  }

  static async createPocket(pocket: Omit<Pocket, 'id' | 'createdAt'>): Promise<Pocket | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const basePayload = {
      user_id: user.id,
      name: pocket.name,
      balance: pocket.balance,
      target_amount: pocket.targetAmount,
      color: pocket.color,
      icon_name: pocket.iconName,
    };

    let result = await supabase
      .from('pockets')
      .insert({
        ...basePayload,
        is_asset: pocket.isAsset ?? false,
      })
      .select()
      .single();

    // Fallback if is_asset column does not exist yet in Supabase
    if (result.error && (result.error.message?.includes('is_asset') || result.error.code === '42703')) {
      result = await supabase
        .from('pockets')
        .insert(basePayload)
        .select()
        .single();
    }

    if (result.error || !result.data) return null;

    const data = result.data;
    return {
      id: data.id,
      name: data.name,
      balance: Number(data.balance),
      targetAmount: Number(data.target_amount),
      color: data.color,
      iconName: data.icon_name,
      createdAt: new Date(data.created_at).getTime(),
      isAsset: Boolean(data.is_asset ?? pocket.isAsset),
    };
  }

  static async updatePocket(id: string, updates: Partial<Pocket>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.balance !== undefined) payload.balance = updates.balance;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
    if (updates.isAsset !== undefined) payload.is_asset = updates.isAsset;

    let { error } = await supabase
      .from('pockets')
      .update(payload)
      .eq('id', id);

    // Fallback if is_asset column does not exist yet in Supabase
    if (error && (error.message?.includes('is_asset') || error.code === '42703') && payload.is_asset !== undefined) {
      delete payload.is_asset;
      const retry = await supabase
        .from('pockets')
        .update(payload)
        .eq('id', id);
      error = retry.error;
    }

    return !error;
  }

  static async deletePocket(id: string, name?: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if id is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      return !error;
    } else if (name) {
      // Legacy or starter string ID (e.g. 'pkt_mandiri'), match by name & user_id
      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('name', name)
        .eq('user_id', user.id);

      return !error;
    } else {
      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('name', id)
        .eq('user_id', user.id);

      return !error;
    }
  }

  // ========================================================
  // 3. TRANSACTIONS
  // ========================================================
  static async getTransactions(): Promise<Transaction[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data
      .map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        amount: Number(t.amount),
        type: t.type,
        date: t.date,
        dateGroup: t.date_group || 'TODAY',
        time: t.time || '12:00 PM',
        timestamp: t.timestamp ? Number(t.timestamp) : new Date(t.created_at).getTime(),
        iconName: t.icon_name,
        cardNumber: t.card_number,
        recipient: t.recipient,
        note: t.note,
        pocketId: t.pocket_id,
        pocketName: t.pocket_name,
      }))
      .sort((a, b) => {
        const timeA = a.timestamp || (a.date ? new Date(`${a.date} ${a.time || '00:00'}`).getTime() : 0);
        const timeB = b.timestamp || (b.date ? new Date(`${b.date} ${b.time || '00:00'}`).getTime() : 0);
        return timeB - timeA;
      });
  }

  static async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        title: tx.title,
        category: tx.category,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        date_group: tx.dateGroup,
        time: tx.time,
        timestamp: tx.timestamp,
        icon_name: tx.iconName,
        card_number: tx.cardNumber,
        recipient: tx.recipient,
        note: tx.note,
        pocket_id: tx.pocketId || null,
        pocket_name: tx.pocketName,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      amount: Number(data.amount),
      type: data.type,
      date: data.date,
      dateGroup: data.date_group,
      time: data.time,
      timestamp: Number(data.timestamp),
      iconName: data.icon_name,
      cardNumber: data.card_number,
      recipient: data.recipient,
      note: data.note,
      pocketId: data.pocket_id,
      pocketName: data.pocket_name,
    };
  }

  static async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>
  ): Promise<Transaction | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.dateGroup !== undefined) payload.date_group = updates.dateGroup;
    if (updates.time !== undefined) payload.time = updates.time;
    if (updates.timestamp !== undefined) payload.timestamp = updates.timestamp;
    if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
    if (updates.cardNumber !== undefined) payload.card_number = updates.cardNumber;
    if (updates.recipient !== undefined) payload.recipient = updates.recipient;
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.pocketId !== undefined) payload.pocket_id = updates.pocketId || null;
    if (updates.pocketName !== undefined) payload.pocket_name = updates.pocketName;

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      amount: Number(data.amount),
      type: data.type,
      date: data.date,
      dateGroup: data.date_group,
      time: data.time,
      timestamp: Number(data.timestamp),
      iconName: data.icon_name,
      cardNumber: data.card_number,
      recipient: data.recipient,
      note: data.note,
      pocketId: data.pocket_id,
      pocketName: data.pocket_name,
    };
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return !error;
  }

  // ========================================================
  // 4. PAYMENT CARDS & BANK ACCOUNTS
  // ========================================================
  static async getCards(): Promise<PaymentCard[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('payment_cards')
      .select('*')
      .order('is_default', { ascending: false });

    if (error || !data) return [];

    return data.map((c) => ({
      id: c.id,
      bankName: c.bank_name,
      accountNumber: c.account_number,
      accountHolder: c.account_holder,
      cardHolder: c.card_holder,
      cardNumberMask: c.card_number_mask,
      cardExpiry: c.card_expiry,
      brand: c.brand,
      isDefault: c.is_default,
      colorGradient: c.color_gradient,
    }));
  }

  static async createCard(card: Omit<PaymentCard, 'id'>): Promise<PaymentCard | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('payment_cards')
      .insert({
        user_id: user.id,
        bank_name: card.bankName,
        account_number: card.accountNumber,
        account_holder: card.accountHolder,
        card_holder: card.cardHolder,
        card_number_mask: card.cardNumberMask,
        card_expiry: card.cardExpiry,
        brand: card.brand || 'visa',
        is_default: card.isDefault || false,
        color_gradient: card.colorGradient,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      bankName: data.bank_name,
      accountNumber: data.account_number,
      accountHolder: data.account_holder,
      cardHolder: data.card_holder,
      cardNumberMask: data.card_number_mask,
      cardExpiry: data.card_expiry,
      brand: data.brand,
      isDefault: data.is_default,
      colorGradient: data.color_gradient,
    };
  }

  static async updateCard(id: string, updates: Partial<PaymentCard>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const payload: Record<string, any> = {};
    if (updates.bankName !== undefined) payload.bank_name = updates.bankName;
    if (updates.accountNumber !== undefined) payload.account_number = updates.accountNumber;
    if (updates.accountHolder !== undefined) payload.account_holder = updates.accountHolder;
    if (updates.cardHolder !== undefined) payload.card_holder = updates.cardHolder;
    if (updates.cardNumberMask !== undefined) payload.card_number_mask = updates.cardNumberMask;
    if (updates.cardExpiry !== undefined) payload.card_expiry = updates.cardExpiry;
    if (updates.brand !== undefined) payload.brand = updates.brand;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;
    if (updates.colorGradient !== undefined) payload.color_gradient = updates.colorGradient;

    const { error } = await supabase
      .from('payment_cards')
      .update(payload)
      .eq('id', id);

    return !error;
  }

  static async deleteCard(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { error } = await supabase
      .from('payment_cards')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========================================================
  // 5. DEBTS & LOANS
  // ========================================================
  static async getDebts(): Promise<DebtItem[]> {
    if (!this.isConfigured()) return [];
    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('*')
      .order('due_date', { ascending: true });

    if (debtsError || !debts) return [];

    const { data: payments } = await supabase
      .from('debt_payments')
      .select('*')
      .order('date', { ascending: false });

    return debts.map((d) => {
      const debtPayments: DebtPaymentRecord[] = (payments || [])
        .filter((p) => p.debt_id === d.id)
        .map((p) => ({
          id: p.id,
          date: p.date,
          amount: Number(p.amount),
          pocketName: p.pocket_name,
        }));

      return {
        id: d.id,
        title: d.title,
        lender: d.lender,
        totalAmount: Number(d.total_amount),
        remainingAmount: Number(d.remaining_amount),
        dueDate: d.due_date,
        installmentCount: d.installment_count,
        paidInstallments: d.paid_installments,
        status: d.status,
        reminderNotes: d.reminder_notes,
        createdAt: new Date(d.created_at).getTime(),
        paymentHistory: debtPayments,
      };
    });
  }

  static async createDebt(debt: Omit<DebtItem, 'id' | 'createdAt'>): Promise<DebtItem | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        title: debt.title,
        lender: debt.lender,
        total_amount: debt.totalAmount,
        remaining_amount: debt.remainingAmount,
        due_date: debt.dueDate,
        installment_count: debt.installmentCount || 12,
        paid_installments: debt.paidInstallments || 0,
        status: debt.status || 'active',
        reminder_notes: debt.reminderNotes,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      lender: data.lender,
      totalAmount: Number(data.total_amount),
      remainingAmount: Number(data.remaining_amount),
      dueDate: data.due_date,
      installmentCount: data.installment_count,
      paidInstallments: data.paid_installments,
      status: data.status,
      reminderNotes: data.reminder_notes,
      createdAt: new Date(data.created_at).getTime(),
      paymentHistory: [],
    };
  }

  static async payDebtInstallment(
    debtId: string, 
    amount: number, 
    pocketId?: string, 
    pocketName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Get debt
    const { data: debt } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .single();

    if (!debt) return false;

    const newRemaining = Math.max(0, Number(debt.remaining_amount) - amount);
    const newPaidCount = (debt.paid_installments || 0) + 1;
    const newStatus = newRemaining === 0 ? 'paid_off' : debt.status;

    // 2. Insert payment record
    await supabase.from('debt_payments').insert({
      debt_id: debtId,
      user_id: user.id,
      amount,
      pocket_id: pocketId || null,
      pocket_name: pocketName || 'Saldo Utama',
    });

    // 3. Update debt remaining
    const { error: debtErr } = await supabase
      .from('debts')
      .update({
        remaining_amount: newRemaining,
        paid_installments: newPaidCount,
        status: newStatus,
      })
      .eq('id', debtId);

    // 4. Deduct pocket balance if linked
    if (pocketId) {
      const { data: pkt } = await supabase
        .from('pockets')
        .select('balance')
        .eq('id', pocketId)
        .single();

      if (pkt) {
        await supabase
          .from('pockets')
          .update({ balance: Math.max(0, Number(pkt.balance) - amount) })
          .eq('id', pocketId);
      }
    }

    return !debtErr;
  }

  static async deleteDebt(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========================================================
  // 6. ASSETS & PORTFOLIO
  // ========================================================
  static async getAssets(): Promise<AssetItem[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('current_value', { ascending: false });

    if (error || !data) return [];

    return data.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      currentValue: Number(a.current_value),
      purchasePrice: Number(a.purchase_price),
      purchaseDate: a.purchase_date,
      notes: a.notes,
      createdAt: new Date(a.created_at).getTime(),
    }));
  }

  static async createAsset(asset: Omit<AssetItem, 'id' | 'createdAt'>): Promise<AssetItem | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        name: asset.name,
        category: asset.category,
        current_value: asset.currentValue,
        purchase_price: asset.purchasePrice,
        purchase_date: asset.purchaseDate,
        notes: asset.notes,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      currentValue: Number(data.current_value),
      purchasePrice: Number(data.purchase_price),
      purchaseDate: data.purchase_date,
      notes: data.notes,
      createdAt: new Date(data.created_at).getTime(),
    };
  }

  static async updateAsset(id: string, updates: Partial<AssetItem>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.currentValue !== undefined) payload.current_value = updates.currentValue;
    if (updates.purchasePrice !== undefined) payload.purchase_price = updates.purchasePrice;
    if (updates.purchaseDate !== undefined) payload.purchase_date = updates.purchaseDate;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase
      .from('assets')
      .update(payload)
      .eq('id', id);

    return !error;
  }

  static async deleteAsset(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========================================================
  // 7. CATEGORY BUDGETS
  // ========================================================
  static async getBudgets(): Promise<CategoryBudget[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('category_budgets')
      .select('*');

    if (error || !data) return [];

    return data.map((b) => ({
      id: b.id,
      category: b.category,
      monthlyLimit: Number(b.monthly_limit),
    }));
  }

  static async saveBudget(category: string, monthlyLimit: number): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('category_budgets')
      .upsert(
        {
          user_id: user.id,
          category,
          monthly_limit: monthlyLimit,
        },
        { onConflict: 'user_id, category' }
      );

    return !error;
  }

  // ========================================================
  // 8. FINANCIAL NOTES
  // ========================================================
  static async getNotes(): Promise<NoteItem[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      date: n.date,
      isPinned: n.is_pinned,
      tag: n.tag,
      createdAt: new Date(n.created_at).getTime(),
    }));
  }

  static async createNote(note: Omit<NoteItem, 'id' | 'createdAt'>): Promise<NoteItem | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: note.title,
        content: note.content,
        date: note.date,
        is_pinned: note.isPinned || false,
        tag: note.tag || 'Umum',
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      date: data.date,
      isPinned: data.is_pinned,
      tag: data.tag,
      createdAt: new Date(data.created_at).getTime(),
    };
  }

  static async updateNote(id: string, updates: Partial<NoteItem>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.isPinned !== undefined) payload.is_pinned = updates.isPinned;
    if (updates.tag !== undefined) payload.tag = updates.tag;

    const { error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', id);

    return !error;
  }

  static async deleteNote(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========================================================
  // 9. WISHLIST (DAFTAR KEINGINAN)
  // ========================================================
  static async getWishlists(): Promise<WishlistItem[]> {
    if (!this.isConfigured()) return [];
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((w) => ({
      id: w.id,
      title: w.title,
      estimatedPrice: Number(w.estimated_price),
      savedAmount: Number(w.saved_amount || 0),
      targetDate: w.target_date,
      priority: w.priority,
      status: w.status,
      note: w.note,
      pocketId: w.pocket_id,
      createdAt: new Date(w.created_at).getTime(),
    }));
  }

  static async createWishlist(wish: Omit<WishlistItem, 'id' | 'createdAt'>): Promise<WishlistItem | null> {
    if (!this.isConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        title: wish.title,
        estimated_price: wish.estimatedPrice,
        saved_amount: wish.savedAmount || 0,
        target_date: wish.targetDate || null,
        priority: wish.priority || 'medium',
        status: wish.status || 'planned',
        note: wish.note || null,
        pocket_id: wish.pocketId || null,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      estimatedPrice: Number(data.estimated_price),
      savedAmount: Number(data.saved_amount || 0),
      targetDate: data.target_date,
      priority: data.priority,
      status: data.status,
      note: data.note,
      pocketId: data.pocket_id,
      createdAt: new Date(data.created_at).getTime(),
    };
  }

  static async updateWishlist(id: string, updates: Partial<WishlistItem>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.estimatedPrice !== undefined) payload.estimated_price = updates.estimatedPrice;
    if (updates.savedAmount !== undefined) payload.saved_amount = updates.savedAmount;
    if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.pocketId !== undefined) payload.pocket_id = updates.pocketId;

    const { error } = await supabase
      .from('wishlists')
      .update(payload)
      .eq('id', id);

    return !error;
  }

  static async deleteWishlist(id: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========================================================
  // 11. RESET USER DATA
  // ========================================================
  static async resetUserData(): Promise<boolean> {
    if (!this.isConfigured()) return true;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;

    try {
      await supabase.from('debt_payments').delete().eq('user_id', user.id);
      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('debts').delete().eq('user_id', user.id);
      await supabase.from('assets').delete().eq('user_id', user.id);
      await supabase.from('category_budgets').delete().eq('user_id', user.id);
      await supabase.from('notes').delete().eq('user_id', user.id);
      await supabase.from('wishlists').delete().eq('user_id', user.id);
      await supabase.from('payment_cards').delete().eq('user_id', user.id);
      await supabase.from('pockets').delete().eq('user_id', user.id);

      await supabase.from('profiles').update({
        balance: 0,
        total_balance: 0,
      }).eq('id', user.id);

      return true;
    } catch (err) {
      console.error('Failed to reset user data in Supabase', err);
      return false;
    }
  }
}
