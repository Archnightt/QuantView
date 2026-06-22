import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { TopNav } from "@/components/TopNav";

const plusJakartaSansSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const plusJakartaSansDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuantView",
  description: "Personal Financial Dashboard",
  icons: {
    icon: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSansSans.variable} ${jetbrainsMono.variable} ${plusJakartaSansDisplay.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="home-dashboard-shell min-h-screen flex flex-col">
            <TopNav />
            <MainContentWrapper>
              {children}
            </MainContentWrapper>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
