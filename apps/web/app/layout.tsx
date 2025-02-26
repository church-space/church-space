// import { ReactScan } from "@/components/react-scan";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@trivo/ui/toaster";
import { TooltipProvider } from "@trivo/ui/tooltip";
import { ReactQueryProvider } from "../components/providers/react-query";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trivo",
  description: "Trivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <ReactScan /> */}
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
