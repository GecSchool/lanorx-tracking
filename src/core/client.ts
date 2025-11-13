import type {
  LanorxConfig,
  EmailSubmitOptions,
  EventTrackOptions,
  ApiResponse,
  EmailSubmitResponse,
  EventTrackResponse,
} from "./types";

// localStorage keys
const DEVICE_ID_KEY = "lanorx_device_id";
const EMAIL_SUBMITTED_KEY = "lanorx_email_submitted";

// TTL for device ID (30 minutes in milliseconds)
const DEVICE_ID_TTL = 30 * 60 * 1000;

/**
 * Interface for stored device ID with expiration
 */
interface StoredDeviceId {
  deviceId: string;
  expiresAt: number;
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  // Simple UUID v4 generation
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid;
}

/**
 * Get or create device ID from localStorage with TTL
 */
function getOrCreateDeviceId(): string | null {
  // Check if running in browser environment
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  try {
    // Try to get existing device ID
    const stored = localStorage.getItem(DEVICE_ID_KEY);

    if (stored) {
      try {
        const parsed: StoredDeviceId = JSON.parse(stored);

        // Check if TTL has expired
        if (Date.now() < parsed.expiresAt) {
          return parsed.deviceId;
        }

        // TTL expired, remove old device ID
        localStorage.removeItem(DEVICE_ID_KEY);
      } catch (parseError) {
        // Handle legacy format (plain string) or corrupted data
        console.warn("Legacy or corrupted deviceId format detected, clearing...");
        localStorage.removeItem(DEVICE_ID_KEY);
      }
    }

    // Generate new device ID with TTL
    const newDeviceId = generateDeviceId();
    const newStored: StoredDeviceId = {
      deviceId: newDeviceId,
      expiresAt: Date.now() + DEVICE_ID_TTL,
    };

    localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(newStored));
    return newDeviceId;
  } catch (error) {
    // localStorage might be disabled or unavailable
    console.warn("Failed to access localStorage for device ID:", error);
    return null;
  }
}

/**
 * Detect device type from user agent
 */
function getDeviceType(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const ua = navigator.userAgent.toLowerCase();

  // Tablet detection (must come before mobile)
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return "tablet";
  }

  // Mobile detection
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/.test(ua)) {
    return "mobile";
  }

  // Default to desktop
  return "desktop";
}

/**
 * Get referrer URL
 */
function getReferrer(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  return document.referrer || null;
}

/**
 * Get user agent string
 */
function getUserAgent(): string | null {
  if (typeof navigator === "undefined") {
    return null;
  }
  return navigator.userAgent || null;
}

/**
 * Get email submission data from localStorage
 */
function getEmailSubmissionData(projectId: string): {
  submitted: boolean;
  email?: string;
  submittedAt?: string;
} {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { submitted: false };
  }

  try {
    const data = localStorage.getItem(`${EMAIL_SUBMITTED_KEY}_${projectId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Failed to get email submission data:", error);
  }

  return { submitted: false };
}

/**
 * Save email submission to localStorage
 */
function saveEmailSubmission(projectId: string, email: string): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    const data = {
      submitted: true,
      email,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `${EMAIL_SUBMITTED_KEY}_${projectId}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Failed to save email submission:", error);
  }
}

/**
 * Lanorx SDK Client
 *
 * @example
 * ```typescript
 * const client = new LanorxClient({
 *   projectId: 'proj_123',
 *   apiKey: 'lnx_sk_...'
 * });
 *
 * await client.submitEmail({ email: 'user@example.com' });
 * await client.trackEvent({ type: 'VIEW' });
 * ```
 */
export class LanorxClient {
  private config: Required<LanorxConfig>;
  private deviceId: string | null;

  constructor(config: LanorxConfig) {
    this.config = {
      apiUrl: "https://www.lanorx.com",
      ...config,
    };

    if (!this.config.projectId) {
      throw new Error("projectId is required");
    }

    if (!this.config.apiKey) {
      throw new Error("apiKey is required");
    }

    // Initialize device ID
    this.deviceId = getOrCreateDeviceId();
  }

  /**
   * Check if user has already submitted an email for this project
   */
  hasSubmittedEmail(): {
    submitted: boolean;
    email?: string;
    submittedAt?: string;
  } {
    return getEmailSubmissionData(this.config.projectId);
  }

  /**
   * Submit an email to the project
   * Automatically collects deviceType, referrer, and userAgent
   */
  async submitEmail(
    options: EmailSubmitOptions
  ): Promise<ApiResponse<EmailSubmitResponse>> {
    const url = `${this.config.apiUrl}/api/v1/projects/${this.config.projectId}/emails`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          email: options.email,
          deviceId: this.deviceId,
          deviceType: getDeviceType(),
          referrer: getReferrer(),
          userAgent: getUserAgent(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      // Save email submission to localStorage on success
      saveEmailSubmission(this.config.projectId, options.email);

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Track an event
   * Automatically collects deviceType, referrer, and userAgent
   */
  async trackEvent(
    options: EventTrackOptions
  ): Promise<ApiResponse<EventTrackResponse>> {
    const url = `${this.config.apiUrl}/api/v1/projects/${this.config.projectId}/events`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          type: options.type,
          contentId: options.contentId,
          deviceId: this.deviceId,
          deviceType: getDeviceType(),
          referrer: getReferrer(),
          userAgent: getUserAgent(),
          meta: options.meta,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Track a page view event
   * Automatically collects deviceType, referrer, and userAgent
   */
  async trackPageView(contentId?: string): Promise<ApiResponse<EventTrackResponse>> {
    return this.trackEvent({
      type: "VIEW",
      contentId,
    });
  }

  /**
   * Track a CTA click event
   *
   * @param section - The section where the CTA was clicked ('header', 'hero', 'pricing', etc.)
   * @param contentId - Optional A/B testing variant ID
   *
   * @example
   * ```typescript
   * await client.trackCTA('hero');
   * await client.trackCTA('pricing', 'variant-a');
   * ```
   */
  async trackCTA(section: string, contentId?: string): Promise<ApiResponse<EventTrackResponse>> {
    return this.trackEvent({
      type: "CTA",
      contentId,
      meta: {
        section,
      },
    });
  }

  /**
   * Track a navigation event (advanced)
   *
   * @param meta - Custom metadata for navigation tracking
   * @param contentId - Optional A/B testing variant ID
   */
  async trackNavigate(meta?: Record<string, unknown>, contentId?: string): Promise<ApiResponse<EventTrackResponse>> {
    return this.trackEvent({
      type: "NAVIGATE",
      contentId,
      meta,
    });
  }
}
