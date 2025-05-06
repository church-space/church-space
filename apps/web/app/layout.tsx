// import { ReactScan } from "@/components/react-scan";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@church-space/ui/toaster";
import { TooltipProvider } from "@church-space/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Church Space",
    template: "%s | Church Space",
  },
  description: "The better way to email your church",
  openGraph: {
    title: "Church Space",
    description: "The better way to email your church",
    url: "https://churchspace.co",
    siteName: "Church Space",
    images: [
      {
        url: "https://churchspace.co/og-image.jpg", // Must be an absolute URL
        width: 800,
        height: 600,
      },
    ],

    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head> */}
      {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}
      {/* </head> */}
      {/* <ReactScan /> */}
      <body className={`${inter.className} antialiased`}>
        <TooltipProvider delayDuration={300}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TooltipProvider>

        <Toaster />
      </body>
    </html>
  );
}
