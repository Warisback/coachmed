import type { Metadata } from 'next';
import { Instrument_Sans, Inter_Tight } from 'next/font/google';
import './globals.css';

const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' });

export const metadata: Metadata = {
  title: 'CoachMed',
  description: 'Medication check-ins that reach the practice before the review.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${interTight.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
