import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/lib/i18n';
import { UserProvider } from '@/lib/user';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'Krishi Mitra',
  description: 'Your AI farming companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <LanguageProvider>
              <UserProvider>
                {children}
                <Toaster />
              </UserProvider>
            </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
