// import { ReactScan } from "@/components/react-scan";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@church-space/ui/toaster";
import { TooltipProvider } from "@church-space/ui/tooltip";
import { ReactQueryProvider } from "../components/providers/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Church Space",
  description: "Church Space",
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
          <TooltipProvider delayDuration={300}>
            <NuqsAdapter>{children}</NuqsAdapter>
          </TooltipProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
