import { inject, ref, onMounted, type Ref } from "vue";
import { LanorxClient } from "../core/client";
import type {
  EmailSubmitOptions,
  EventTrackOptions,
  ApiResponse,
  EmailSubmitResponse,
  EventTrackResponse,
} from "../core/types";

/**
 * Composable to access Lanorx client
 */
export function useLanorx(): LanorxClient {
  const client = inject<LanorxClient>("lanorx");
  if (!client) {
    throw new Error("Lanorx client not found. Did you install the plugin?");
  }
  return client;
}

/**
 * Composable for submitting emails
 *
 * Automatically checks submission status on mount
 */
export function useEmail() {
  const client = useLanorx();
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);
  const submissionStatus: Ref<{
    submitted: boolean;
    email?: string;
    submittedAt?: string;
  }> = ref({ submitted: false });

  // Auto-check submission status on mount
  onMounted(() => {
    const status = client.hasSubmittedEmail();
    submissionStatus.value = status;
  });

  const submitEmail = async (
    options: EmailSubmitOptions
  ): Promise<ApiResponse<EmailSubmitResponse>> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await client.submitEmail(options);
      if (!result.success) {
        error.value = result.error || "Failed to submit email";
      } else {
        // Update submission status after successful submit
        submissionStatus.value = {
          submitted: true,
          email: options.email,
          submittedAt: new Date().toISOString(),
        };
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  const hasSubmittedEmail = () => {
    return client.hasSubmittedEmail();
  };

  return {
    submitEmail,
    hasSubmittedEmail,
    submissionStatus,
    loading,
    error,
  };
}

/**
 * Composable for tracking events
 *
 * Provides specific tracking functions for each event type
 */
export function useTracking() {
  const client = useLanorx();
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  const trackEvent = async (
    options: EventTrackOptions
  ): Promise<ApiResponse<EventTrackResponse>> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await client.trackEvent(options);
      if (!result.success) {
        error.value = result.error || "Failed to track event";
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
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
    trackCTA,
    trackNavigate,
    loading,
    error,
  };
}
