import { writable, derived, get } from "svelte/store";
import { LanorxClient } from "../core/client";
import type {
  LanorxConfig,
  EmailSubmitOptions,
  EventTrackOptions,
  ApiResponse,
  EmailSubmitResponse,
  EventTrackResponse,
} from "../core/types";

let clientInstance: LanorxClient | null = null;

export interface LanorxInitOptions extends LanorxConfig {
  autoTrackPageView?: boolean; // Default: true
}

/**
 * Initialize Lanorx client
 *
 * Automatically tracks page view unless autoTrackPageView is set to false
 */
export function initLanorx(options: LanorxInitOptions) {
  const { autoTrackPageView = true, ...config } = options;
  clientInstance = new LanorxClient(config);

  // Auto-track page view on initialization
  if (autoTrackPageView) {
    clientInstance.trackPageView();
  }

  return clientInstance;
}

/**
 * Get Lanorx client instance
 */
export function getLanorxClient(): LanorxClient {
  if (!clientInstance) {
    throw new Error("Lanorx not initialized. Call initLanorx() first.");
  }
  return clientInstance;
}

/**
 * Email submission store
 *
 * Automatically checks submission status on creation
 */
export function createEmailStore() {
  const client = getLanorxClient();
  const loading = writable(false);
  const error = writable<string | null>(null);

  // Auto-check submission status
  const initialStatus = client.hasSubmittedEmail();
  const submissionStatus = writable<{
    submitted: boolean;
    email?: string;
    submittedAt?: string;
  }>(initialStatus);

  const submitEmail = async (
    options: EmailSubmitOptions
  ): Promise<ApiResponse<EmailSubmitResponse>> => {
    loading.set(true);
    error.set(null);

    try {
      const result = await client.submitEmail(options);
      if (!result.success) {
        error.set(result.error || "Failed to submit email");
      } else {
        // Update submission status after successful submit
        submissionStatus.set({
          submitted: true,
          email: options.email,
          submittedAt: new Date().toISOString(),
        });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      error.set(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.set(false);
    }
  };

  const hasSubmittedEmail = () => {
    return client.hasSubmittedEmail();
  };

  return {
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    submissionStatus: { subscribe: submissionStatus.subscribe },
    submitEmail,
    hasSubmittedEmail,
  };
}

/**
 * Event tracking store
 *
 * Provides specific tracking functions for each event type
 */
export function createTrackingStore() {
  const client = getLanorxClient();
  const loading = writable(false);
  const error = writable<string | null>(null);

  const trackEvent = async (
    options: EventTrackOptions
  ): Promise<ApiResponse<EventTrackResponse>> => {
    loading.set(true);
    error.set(null);

    try {
      const result = await client.trackEvent(options);
      if (!result.success) {
        error.set(result.error || "Failed to track event");
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      error.set(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.set(false);
    }
  };

  const trackCTA = async (
    section: string,
    contentId?: string
  ): Promise<ApiResponse<EventTrackResponse>> => {
    return client.trackCTA(section, contentId);
  };

  const trackNavigate = async (
    meta?: Record<string, any>,
    contentId?: string
  ): Promise<ApiResponse<EventTrackResponse>> => {
    return client.trackNavigate(meta, contentId);
  };

  return {
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    trackCTA,
    trackNavigate,
  };
}
