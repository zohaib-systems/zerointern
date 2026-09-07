import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SiteChrome from "@/components/common/SiteChrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-track-sans", display: "swap" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-track-mono", display: "swap" });

export const metadata: Metadata = {
  title: "ZeroIntern",
  description: "Build, learn, and ship projects through guided tracks.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#20A562] focus:px-4 focus:py-3 focus:text-white">Skip to content</a><SiteChrome navbar={<Navbar />} footer={<Footer />}>{children}</SiteChrome></body>
    </html>
  );
}
