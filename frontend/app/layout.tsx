import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'APIForge — API Client Platform',
  description: 'A production-quality API client for testing and documenting APIs. Build, test, and collaborate.',
  keywords: ['API client', 'REST client', 'HTTP client', 'API testing'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="h-screen overflow-hidden bg-[#1a1a1a] text-[#e8e8e8] font-[family-name:var(--font-inter)]">
        <Providers>
          {children}
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2e2e2e',
              border: '1px solid #3a3a3a',
              color: '#e8e8e8',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
