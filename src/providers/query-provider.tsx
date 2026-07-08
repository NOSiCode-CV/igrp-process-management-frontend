"use client";

import type { ReactNode } from "react";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "./query-client";

let browserClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  // Server: always a fresh client per request. Browser: reuse a singleton.
  if (typeof window === "undefined") return makeQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}

export function IGRPQueryProvider({ children }: { children: ReactNode }) {
  const client = getQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
