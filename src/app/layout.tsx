import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import '@/styles/index.css';
import { APP_NAV } from '@/constants/nav';
import AppHeader from '@/components/app-header';
import Sidebar from '@/components/sidebar';
import BottomNav from '@/components/bottom-nav';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Spa',
  description: 'Head spa app',
  icons: {
    icon: '/headspa.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  //   const isLoggedIn = cookieStore.has('access_token');
  const token = cookieStore.get('access_token')?.value;
  const isAuthenticated = Boolean(token);

  //   const headersList = await headers();
  //   const username = headersList.get('x-user-username')!;
  const username = cookieStore.get('username')?.value;

  //   return (
  //     <html lang="vi" suppressHydrationWarning={true}>
  //       <body className={inter.className}>
  //         <ThemeProvider
  //           attribute="class"
  //           defaultTheme="dark"
  //           enableSystem={false}
  //           disableTransitionOnChange
  //         >
  //           {isAuthenticated ? (
  //             <div className="min-h-screen bg-background">
  //               <AppHeader />
  //               <Sidebar nav={APP_NAV} />
  //               <main className="md:ml-60 min-h-[calc(100vh-3.5rem)] pb-16 md:pb-0">
  //                 {children}
  //               </main>
  //               <BottomNav nav={APP_NAV} />
  //             </div>
  //           ) : (
  //             <div className="flex min-h-screen items-center justify-center bg-background">
  //               {/* <LoginComponent /> */}
  //               {children}
  //             </div>
  //           )}
  //         </ThemeProvider>
  //       </body>
  //     </html>
  //   );
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <AppHeader isAuthenticated={isAuthenticated} username={username!} />
            {isAuthenticated && <Sidebar nav={APP_NAV} />}
            <main className="md:ml-60 min-h-[calc(100vh-3.5rem)] pb-16 md:pb-0">
              {children}
            </main>
            {isAuthenticated && <BottomNav nav={APP_NAV} />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
