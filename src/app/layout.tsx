import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'MyPocket - Smart Personal Finance',
  description: 'Next-generation personal finance tracking with clean aesthetic, mPIN security, and bilingual support.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MyPocket',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0D15',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#07090F] text-white">
        <LanguageProvider>
          <AuthProvider>
            <FinanceProvider>
              {children}
            </FinanceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
