import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Sans_Bengali } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pakka - Check before you accept",
  description: "An AI fraud analyst for every student's inbox. Paste, upload or screenshot any job or internship offer and get a Trust Score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansDevanagari.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
