import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className="min-h-screen bg-surface-900 antialiased">
        <ThemeProvider>
          <Sidebar />
          <div className="transition-all duration-300 ml-[240px]">
            <Topbar />
            <main className="p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
