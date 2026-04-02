import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blazion Forms | AI-Powered Indian Form Builder",
  description:
    "Build professional forms with AI in seconds. Made for India — supports Aadhaar, PAN, UPI, Hindi, and 10 languages. Free to start.",
  keywords: "form builder, India, AI, Aadhaar, online forms, survey",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <TooltipProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#fcf9f1",
                border: "1px solid rgba(191,200,199,0.3)",
                color: "#1c1c17",
                fontFamily: "var(--font-inter)",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
