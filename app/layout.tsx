import type { Metadata } from "next";
import "../styles/globals.css";
import Footer from "@/components/common/Footer";

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
    <html lang="en">
      <body><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#20A562] focus:px-4 focus:py-3 focus:text-white">Skip to content</a><div id="main-content">{children}</div><Footer /></body>
    </html>
  );
}
