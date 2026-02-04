import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const museoSans = localFont({
  src: [
    { path: '../fonts/MuseoSans-100.otf', weight: '100', style: 'normal' },
    { path: '../fonts/MuseoSans-100Italic.otf', weight: '100', style: 'italic' },
    { path: '../fonts/MuseoSans-300.otf', weight: '300', style: 'normal' },
    { path: '../fonts/MuseoSans-300Italic.otf', weight: '300', style: 'italic' },
    /* Note: Filename format differs slightly for 500/700/900 based on user list (MuseoSans_500.otf vs MuseoSans-300.otf) */
    { path: '../fonts/MuseoSans_500.otf', weight: '500', style: 'normal' },
    { path: '../fonts/MuseoSans_500_Italic.otf', weight: '500', style: 'italic' },
    { path: '../fonts/MuseoSans_700.otf', weight: '700', style: 'normal' },
    { path: '../fonts/MuseoSans-700Italic.otf', weight: '700', style: 'italic' }, // Check filename consistency
    { path: '../fonts/MuseoSans_900.otf', weight: '900', style: 'normal' },
    { path: '../fonts/MuseoSans-900Italic.otf', weight: '900', style: 'italic' }, // Check filename consistency
  ],
  variable: '--font-museo' // Make it available as variable too if needed
});

export const metadata: Metadata = {
  title: "Manual de Productos",
  description: "Manual Interactivo de Productos Just",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { CountryProvider } from "@/context/CountryContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${museoSans.className} ${museoSans.variable}`}>
        <CountryProvider>
          {children}
        </CountryProvider>
      </body>
    </html>
  );
}
