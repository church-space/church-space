"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";

interface ReactQueryProviderProps {
  children: ReactNode;
}

// Create a default QueryClient that can be used as fallback
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Use try/catch to handle potential errors with useMemo
  let queryClient;
  try {
    queryClient = useMemo(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000, // 1 minute
              gcTime: 5 * 60 * 1000, // 5 minutes
              retry: 1,
              refetchOnWindowFocus: false,
            },
            mutations: {
              retry: 1,
            },
          },
        }),
      [],
    );
  } catch (error) {
    console.warn(
      "Failed to create QueryClient with useMemo, using default client",
      error,
    );
    queryClient = defaultQueryClient;
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
