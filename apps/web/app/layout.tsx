// import { ReactScan } from "@/components/react-scan";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@church-space/ui/toaster";
import { TooltipProvider } from "@church-space/ui/tooltip";
import Head from "next/head";
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
    <html lang="en" suppressHydrationWarning>
      <Head>
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}
        <meta
          property="og:title"
          content="The better way to email your church"
        />
        <meta
          property="og:description"
          content="Church Space is a platform that helps churches send emails to their members."
        />
        <meta
          property="og:image"
          content="https://churchspace.co/og-image.jpg"
        />
        <meta property="og:url" content="https://churchspace.co/" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Church Space" />
        <meta name="twitter:description" content="Church Space" />
        <meta
          name="twitter:image"
          content="https://churchspace.co/og-image.jpg"
        />
      </Head>
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
