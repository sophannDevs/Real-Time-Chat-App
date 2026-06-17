import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter is a clean, professional sans-serif designed for screens.
// subsetting to 'latin' keeps the font file small.
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatApp',
  description: 'Real-time chat application built with Next.js and Socket.IO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
