import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "TradeFlow — Trading Journal",
  description: "A modern trading journal to track, analyze, and improve your trading performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-900 antialiased overflow-x-hidden">
        <ThemeProvider>
          <Sidebar />
          <div className="transition-all duration-300 ml-0 md:ml-[240px] pb-16 md:pb-0">
            <Topbar />
            <main className="p-0 md:p-6 pt-6 md:pt-6">{children}</main>
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
