'use client';

import React, { createContext, useContext, useMemo, useEffect } from "react";
import { LanorxClient } from "../core/client";
import type { LanorxConfig } from "../core/types";

interface LanorxContextValue {
  client: LanorxClient;
}

const LanorxContext = createContext<LanorxContextValue | null>(null);

export interface LanorxProviderProps {
  children: React.ReactNode;
  projectId: string;
  apiKey: string;
  apiUrl?: string;
  autoTrackPageView?: boolean; // Default: true
}

/**
 * Lanorx Provider Component
 *
 * Automatically tracks page view on mount unless autoTrackPageView is set to false
 *
 * @example
 * ```tsx
 * <LanorxProvider projectId="proj_123" apiKey="lnx_sk_...">
 *   <App />
 * </LanorxProvider>
 * ```
 */
export function LanorxProvider({
  children,
  projectId,
  apiKey,
  apiUrl,
  autoTrackPageView = true,
}: LanorxProviderProps) {
  const client = useMemo(
    () => new LanorxClient({ projectId, apiKey, apiUrl }),
    [projectId, apiKey, apiUrl]
  );

  // Auto-track page view on mount
  useEffect(() => {
    if (autoTrackPageView) {
      client.trackPageView();
    }
  }, [client, autoTrackPageView]);

  return (
    <LanorxContext.Provider value={{ client }}>
      {children}
    </LanorxContext.Provider>
  );
}

/**
 * Hook to access Lanorx client
 */
export function useLanorx(): LanorxClient {
  const context = useContext(LanorxContext);

  if (!context) {
    throw new Error("useLanorx must be used within LanorxProvider");
  }

  return context.client;
}
