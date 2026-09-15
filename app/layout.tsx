import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IntroOverlay } from "@/components/intro/intro-overlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Furqan's Desk",
  description: "Think. Plan. Execute.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <IntroOverlay />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
