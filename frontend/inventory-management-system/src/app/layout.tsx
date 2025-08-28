import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Sidebar from "@/components/nav/Sidebar";
import MobileMenuButton from "@/components/nav/MobileMenuButton";
import NotificationBell from "@/components/nav/NotificationBell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Mind",
  description: "Manage your shop efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-dvh overflow-hidden">
          <Sidebar title="Shop Mind" />
          <main className="md:ml-60 p-2 md:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <MobileMenuButton />
            </div>
            {children}
          </main>
        </div>
        <div className="fixed top-3 right-3 z-50">
          <NotificationBell />
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
