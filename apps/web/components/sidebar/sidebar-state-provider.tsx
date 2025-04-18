"use client";

import { useState, useLayoutEffect } from "react";
import { SidebarProvider } from "@church-space/ui/sidebar";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(true);

  // Use useLayoutEffect to handle client-side initialization
  useLayoutEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split("; ");
    const cookieEntry = cookies.find((cookie) =>
      cookie.startsWith(`${SIDEBAR_COOKIE_NAME}=`),
    );

    if (cookieEntry) {
      const value = cookieEntry.split("=")[1];
      setSidebarOpen(value === "true");
    }
  }, []);

  // Set cookie when state changes
  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
      {children}
    </SidebarProvider>
  );
}
