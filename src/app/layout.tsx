import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { IconProvider } from '../components/IconProvider';
import { ClientLayout } from '../components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'Harshz Green Building Automation',
  description: 'Automation Platform for green building projects like GRIHA and IGBC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <IconProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </IconProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
