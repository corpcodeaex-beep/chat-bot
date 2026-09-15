import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: `${BRAND.name}: AI chat assistants for businesses`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name}: AI chat assistants that answer your customers 24/7`,
    description: "Replies instantly in English, Urdu and Roman Urdu, learns from your website and documents, and sends you every lead.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
