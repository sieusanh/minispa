import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/index.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { APP_NAV } from '@/constants/nav';
import AppHeader from '@/components/app-header';
import Sidebar from '@/components/sidebar';
import BottomNav from '@/components/bottom-nav';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Spa',
  description: 'Head spa app',
  icons: {
    icon: '/headspa.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <AppHeader />
            <Sidebar nav={APP_NAV} />
            <main className="md:ml-60 min-h-[calc(100vh-3.5rem)] pb-16 md:pb-0">
              {children}
            </main>
            <BottomNav nav={APP_NAV} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
