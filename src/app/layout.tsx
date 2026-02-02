import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/SidebarProvider";
import { MainContentWrapper } from "@/components/MainContentWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlphaDesk",
  description: "Personal Financial Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="h-full relative flex min-h-screen bg-background">
               {/* Sidebar (Fixed on Desktop, Hidden on Mobile) */}
               <Sidebar />
               
               {/* Main Content Area - Shifted Right on Desktop */}
               <MainContentWrapper>
                 {children}
               </MainContentWrapper>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
