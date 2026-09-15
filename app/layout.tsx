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
        {/* Runs before first paint so the real page never flashes behind the intro. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{if(sessionStorage.getItem("furqans-desk-intro-shown")!=="1"){document.documentElement.classList.add("intro-pending");}}catch(e){}})();',
          }}
        />
        <TooltipProvider>
          <div data-app-content className="contents">
            {children}
          </div>
          <IntroOverlay />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
