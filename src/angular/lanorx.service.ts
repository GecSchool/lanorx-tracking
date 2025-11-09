import { Injectable } from "@angular/core";
import { LanorxClient } from "../core/client";
import type {
  LanorxConfig,
  EmailSubmitOptions,
  EventTrackOptions,
  ApiResponse,
  EmailSubmitResponse,
  EventTrackResponse,
} from "../core/types";

export interface LanorxServiceOptions extends LanorxConfig {
  autoTrackPageView?: boolean; // Default: true
}

@Injectable({
  providedIn: "root",
})
export class LanorxService {
  private client: LanorxClient | null = null;

  /**
   * Initialize Lanorx client
   *
   * Automatically tracks page view unless autoTrackPageView is set to false
   */
  init(options: LanorxServiceOptions): void {
    const { autoTrackPageView = true, ...config } = options;
    this.client = new LanorxClient(config);

    // Auto-track page view on initialization
    if (autoTrackPageView) {
      this.client.trackPageView();
    }
  }

  /**
   * Get client instance
   */
  private getClient(): LanorxClient {
    if (!this.client) {
      throw new Error("Lanorx not initialized. Call init() first.");
    }
    return this.client;
  }

  /**
   * Check if user has already submitted an email for this project
   */
  hasSubmittedEmail(): {
    submitted: boolean;
    email?: string;
    submittedAt?: string;
  } {
    return this.getClient().hasSubmittedEmail();
  }

  /**
   * Submit an email
   */
  async submitEmail(
    options: EmailSubmitOptions
  ): Promise<ApiResponse<EmailSubmitResponse>> {
    return this.getClient().submitEmail(options);
  }

  /**
   * Track a CTA event
   */
  async trackCTA(section: string, contentId?: string): Promise<ApiResponse<EventTrackResponse>> {
    return this.getClient().trackCTA(section, contentId);
  }

  /**
   * Track a navigate event (advanced)
   */
  async trackNavigate(meta?: Record<string, any>, contentId?: string): Promise<ApiResponse<EventTrackResponse>> {
    return this.getClient().trackNavigate(meta, contentId);
  }
}
