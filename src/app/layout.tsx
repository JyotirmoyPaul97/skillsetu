import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKILL SETU — Skill Intelligence Ecosystem",
  description:
    "From Skill Claims to Skill Evidence. AI-Powered Skill Intelligence & Academia–Industry Ecosystem connecting students, industry, academia and institutions.",
  keywords: [
    "SKILL SETU",
    "Skill Intelligence",
    "Academia-Industry Collaboration",
    "Skill Evidence",
    "Role Readiness",
    "Skill Passport",
    "SIH 2026",
  ],
  authors: [{ name: "SKILL SETU" }],
  openGraph: {
    title: "SKILL SETU — Skill Intelligence Ecosystem",
    description:
      "From Skill Claims to Skill Evidence. AI-Powered Skill Intelligence & Academia–Industry Ecosystem.",
    siteName: "SKILL SETU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKILL SETU — Skill Intelligence Ecosystem",
    description:
      "From Skill Claims to Skill Evidence. AI-Powered Skill Intelligence & Academia–Industry Ecosystem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
