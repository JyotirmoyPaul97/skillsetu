import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKILL SETU — Academia-Industry Collaboration Portal",
  description:
    "A unified platform connecting students, industries, and academicians. AI-Powered Skill Intelligence: From Skill Claims to Skill Evidence.",
  keywords: [
    "SKILL SETU",
    "Skill Intelligence",
    "Academia-Industry Collaboration",
    "Student Portal",
    "Industry Portal",
    "Academia Portal",
    "Institution Portal",
    "SIH 2026",
  ],
  authors: [{ name: "SKILL SETU" }],
  openGraph: {
    title: "SKILL SETU — Skill Intelligence Ecosystem",
    description:
      "AI-Powered Skill Intelligence & Academia–Industry Ecosystem. From Skill Claims to Skill Evidence.",
    siteName: "SKILL SETU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKILL SETU — Skill Intelligence Ecosystem",
    description:
      "AI-Powered Skill Intelligence & Academia–Industry Ecosystem.",
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
