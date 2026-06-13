import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Lora } from "next/font/google";
import { AuthTokenBridge } from "@/components/auth/auth-token-bridge";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora"
});

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Platform",
  description: "AI-powered assessment and teaching assistant"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
          <AuthTokenBridge />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
