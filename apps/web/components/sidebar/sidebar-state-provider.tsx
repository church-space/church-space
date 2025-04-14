"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@church-space/ui/sidebar";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(
    undefined,
  );

  // Read cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const cookieEntry = cookies.find((cookie) =>
      cookie.startsWith(`${SIDEBAR_COOKIE_NAME}=`),
    );

    if (cookieEntry) {
      const value = cookieEntry.split("=")[1];
      setSidebarOpen(value === "true");
    } else {
      setSidebarOpen(true); // Default value if cookie doesn't exist
    }
  }, []);

  // Set cookie when state changes
  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  // Don't render until cookie is read to prevent hydration mismatch
  if (sidebarOpen === undefined) {
    return null;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
      {children}
    </SidebarProvider>
  );
}
