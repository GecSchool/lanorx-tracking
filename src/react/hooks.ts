"use client";

import { useCallback, useState, useEffect } from "react";
import { useLanorx } from "./LanorxProvider";
import type {
    EmailSubmitOptions,
    ApiResponse,
    EmailSubmitResponse,
    EventTrackResponse,
} from "../core/types";

/**
 * Hook for submitting emails
 *
 * Automatically checks submission status on mount
 */
export function useEmail() {
    const client = useLanorx();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<{
        submitted: boolean;
        email?: string;
        submittedAt?: string;
    }>({ submitted: false });

    // Auto-check submission status on mount
    useEffect(() => {
        const status = client.hasSubmittedEmail();
        setSubmissionStatus(status);
    }, [client]);

    const submitEmail = useCallback(
        async (
            options: EmailSubmitOptions
        ): Promise<ApiResponse<EmailSubmitResponse>> => {
            setLoading(true);
            setError(null);

            try {
                const result = await client.submitEmail(options);
                if (!result.success) {
                    setError(result.error || "Failed to submit email");
                } else {
                    // Update submission status after successful submit
                    setSubmissionStatus({
                        submitted: true,
                        email: options.email,
                        submittedAt: new Date().toISOString(),
                    });
                }
                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Unknown error";
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage,
                };
            } finally {
                setLoading(false);
            }
        },
        [client]
    );

    const hasSubmittedEmail = useCallback(() => {
        return client.hasSubmittedEmail();
    }, [client]);

    return {
        submitEmail,
        hasSubmittedEmail,
        submissionStatus, // Auto-checked on mount
        loading,
        error,
    };
}

/**
 * Hook for tracking events
 *
 * Provides specific tracking functions for each event type
 */
export function useTracking() {
    const client = useLanorx();

    const trackCTA = useCallback(
        async (
            section: string,
            contentId?: string
        ): Promise<ApiResponse<EventTrackResponse>> => {
            return client.trackCTA(section, contentId);
        },
        [client]
    );

    const trackNavigate = useCallback(
        async (
            meta?: Record<string, any>,
            contentId?: string
        ): Promise<ApiResponse<EventTrackResponse>> => {
            return client.trackNavigate(meta, contentId);
        },
        [client]
    );

    return {
        trackCTA,
        trackNavigate,
    };
}
