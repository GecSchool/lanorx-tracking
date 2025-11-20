/**
 * Event types for tracking
 */
export type EventType = "VIEW" | "CTA" | "SUBMIT" | "CONVERSION" | "NAVIGATE";

/**
 * CTA section types
 */
export type CTASection = "header" | "hero" | "pricing" | "features" | string;

/**
 * Configuration options for Lanorx client
 */
export interface LanorxConfig {
  projectId: string;
  apiKey: string;
}

/**
 * Email submission options
 */
export interface EmailSubmitOptions {
  email: string;
}

/**
 * Event tracking options (internal)
 */
export interface EventTrackOptions {
  type: EventType;
  contentId?: string;
  meta?: Record<string, unknown>;
}

/**
 * API response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Email submission response
 */
export interface EmailSubmitResponse {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Event tracking response
 */
export interface EventTrackResponse {
  id: string;
  type: EventType;
  createdAt: string;
}
