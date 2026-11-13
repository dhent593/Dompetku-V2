# 💳 MyPocket - Personal Finance Web Application

A sleek, luxury dark-mode personal finance web application built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Framer Motion**. Designed for flawless mobile responsiveness, mPIN security simulation, and effortless migration to **Supabase** & **Vercel**.

---

## ✨ Features Implemented (Phase 1)

1. **Exact 1:1 Visual Fidelity**:
   - **Home Dashboard**: Vibrant violet gradient balance card (`$8,482.00`), quick actions (Transfer & Scan QR), recent transactions (`Shopping`, `Wifi Bill`).
   - **Analytics & Statistics**: Total balance card (`$14,482.00`), Withdraw modal, Expenses vs Savings toggle, time period picker, glowing spline wave chart with peak badge (`$1,350`), and category cards (`Travel`, `Investment`, `Food`).
   - **Wallet & Products**: Hero security card with animated biometric fingerprint and 4-digit mPIN dots, 6 product tiles (`Tap to pay`, `Credit cards`, `Scan QR`, `Mobile banking`, `Loans`, `Fund transfer`).
   - **Settings**: Profile card with online indicator badge, edit profile modal, Account Security, interactive Light/Dark toggle, Payment Methods, Support, and Secure Log Out.
   - **Transactions Detail**: Full list grouped by date (`TODAY`, `YESTERDAY`), real-time search, category badges, and custom transaction creation.

2. **Security & Session Management**:
   - **4-Digit mPIN**: Interactive numeric keypad with instant verification (Default PIN: `1234`).
   - **Biometric Unlock Simulation**: Touch ID / Face ID simulation with radial pulse effect.
   - **Lock Screen Overlay**: Auto-locks on demand or after logout.

3. **Device Showcase & Scaling**:
   - Native mobile full-screen experience on smartphones.
   - Desktop view includes an interactive **Phone Frame Mode** (mocking realistic mobile device) and a **Wide View** toggle for large displays.

4. **Service / Repository Pattern**:
   - Clean architecture separating UI from data layer (`src/lib/dataService.ts`).
   - Currently runs on reactive local storage; ready to swap in Supabase client in Phase 2 with zero UI refactoring.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Confetti**: Canvas Confetti
- **Language**: TypeScript (Strict Mode)

---

## 🗺️ Roadmap to Supabase & Vercel (Phase 2 & 3)
1. **Supabase Database**: Provision PostgreSQL schema for `profiles`, `transactions`, and `categories`.
2. **Supabase Auth**: Connect email/magic link and session tokens.
3. **Vercel Deployment**: Link repository, configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and deploy with Edge optimization.

