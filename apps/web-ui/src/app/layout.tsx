import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TypeFigma — Figma to WordPress Theme Generator',
  description: 'Convert Figma designs to WordPress themes automatically',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
