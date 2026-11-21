import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'MyPocket - Smart Personal Finance',
  description: 'Next-generation personal finance tracking with clean aesthetic, mPIN security, and bilingual support.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
  viewportFit: 'cover',
  themeColor: '#07090F',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('mypocket_theme');
                const isLight = savedTheme === 'light';
                const schemeValue = isLight ? 'light' : 'dark';
                const themeColor = isLight ? '#F1F5F9' : '#07090F';
                
                if (isLight) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }

                document.documentElement.style.colorScheme = schemeValue;
                document.documentElement.style.backgroundColor = themeColor;

                // Meta color-scheme
                let csMeta = document.querySelector('meta[name="color-scheme"]');
                if (!csMeta) {
                  csMeta = document.createElement('meta');
                  csMeta.name = 'color-scheme';
                  document.head.appendChild(csMeta);
                }
                csMeta.content = schemeValue;

                // Meta theme-color: clean and re-append
                const metaTheme = document.querySelectorAll('meta[name="theme-color"]');
                metaTheme.forEach(function(m) { m.remove(); });
                const m = document.createElement('meta');
                m.name = 'theme-color';
                m.content = themeColor;
                document.head.appendChild(m);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#F1F5F9] dark:bg-[#07090F] text-slate-900 dark:text-white transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <FinanceProvider>
                {children}
              </FinanceProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
