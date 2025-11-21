# @lanorx/tracking

Official JavaScript SDK for Lanorx - Email collection and event tracking for landing pages.

## Features

-   📧 **Email Collection** - Capture emails from your landing pages
-   📊 **Event Tracking** - Track user interactions and page views
-   🎯 **Multi-Framework** - React, Vue, Svelte, Angular support
-   🪶 **Lightweight** - Zero dependencies (frameworks are optional peer dependencies)
-   🔒 **Type Safe** - Written in TypeScript with full type definitions
-   ⚡ **Fast** - Optimized builds with tree-shaking support

## Installation

```bash
npm install @lanorx/tracking
```

## Quick Start

### Vanilla JavaScript

```typescript
import { LanorxClient } from "@lanorx/tracking";

const client = new LanorxClient({
    projectId: "your_project_id",
    apiKey: "your_api_key",
});

// Check if user has already submitted an email
const status = client.hasSubmittedEmail();
if (status.submitted) {
    console.log("Email already submitted:", status.email);
}

// Submit an email (deviceId automatically managed)
// CONVERSION event is automatically created on server
await client.submitEmail({
    email: "user@example.com",
});

// Track CTA click
await client.trackCTA("hero"); // section: 'header', 'hero', 'pricing', etc.
```

### React

```tsx
import { LanorxProvider, useEmail, useTracking } from '@lanorx/tracking/react';
import type { FormEvent } from 'react';
import type { ApiResponse, EmailSubmitResponse } from '@lanorx/tracking';

function App(): JSX.Element {
  return (
    <LanorxProvider
      projectId="your_project_id"
      apiKey="your_api_key"
    >
      <EmailFormComponent />
    </LanorxProvider>
  );
}

function EmailFormComponent(): JSX.Element {
  const { submitEmail, submissionStatus, loading, error } = useEmail();
  const { trackCTA } = useTracking();

  const handleCTAClick = async (): Promise<void> => {
    await trackCTA('hero');  // section: 'header', 'hero', 'pricing', 'features', etc.
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const email = target.email.value as string;

    const result: ApiResponse<EmailSubmitResponse> = await submitEmail({ email });
    // CONVERSION event is automatically created on server

    if (result.success) {
      console.log('Email submitted successfully');
    }
  };

  // Check submission status (automatically checked on mount)
  if (submissionStatus.submitted) {
    return <div>Thank you! You already submitted: {submissionStatus.email}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Vue

```vue
// main.ts
import { createApp } from 'vue';
import { LanorxPlugin } from '@lanorx/tracking/vue';

const app = createApp(App);

app.use(LanorxPlugin, {
  projectId: 'your_project_id',
  apiKey: 'your_api_key'
});

// EmailForm.vue
<script setup lang="ts">
import { useEmail, useTracking } from '@lanorx/tracking/vue';
import type { ApiResponse, EmailSubmitResponse } from '@lanorx/tracking';

const { submitEmail, submissionStatus, loading, error } = useEmail();
const { trackCTA } = useTracking();

const handleCTAClick = async (): Promise<void> => {
  await trackCTA('hero');  // section: 'header', 'hero', 'pricing', 'features', etc.
};

const handleSubmit = async (email: string): Promise<void> => {
  const result: ApiResponse<EmailSubmitResponse> = await submitEmail({ email });
  // CONVERSION event is automatically created on server

  if (result.success) {
    console.log('Email submitted successfully');
  }
};
</script>

<template>
  <!-- Check submission status (automatically checked on mount) -->
  <div v-if="submissionStatus.submitted">
    Thank you! You already submitted: {{ submissionStatus.email }}
  </div>

  <form v-else @submit.prevent="handleSubmit(($event.target as HTMLFormElement).email.value)">
    <input type="email" name="email" required />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Submitting...' : 'Submit' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>
```

### Svelte

```svelte
<!-- main.ts -->
<script lang="ts">
import { initLanorx, createEmailStore, createTrackingStore } from '@lanorx/tracking/svelte';

initLanorx({
  projectId: 'your_project_id',
  apiKey: 'your_api_key'
});

const emailStoreObj = createEmailStore();
const trackingStoreObj = createTrackingStore();
</script>

<!-- EmailForm.svelte -->
<script lang="ts">
import { emailStoreObj, trackingStoreObj } from './stores';
import type { ApiResponse, EmailSubmitResponse } from '@lanorx/tracking';

const { loading, error, submissionStatus, submitEmail } = emailStoreObj;
const { trackCTA } = trackingStoreObj;

async function handleCTAClick(): Promise<void> {
  await trackCTA('hero');  // section: 'header', 'hero', 'pricing', 'features', etc.
}

async function handleSubmit(event: Event): Promise<void> {
  const target = event.target as HTMLFormElement;
  const email: string = target.email.value;

  const result: ApiResponse<EmailSubmitResponse> = await submitEmail({ email });
  // CONVERSION event is automatically created on server

  if (result.success) {
    console.log('Email submitted successfully');
  }
}
</script>

<!-- Check submission status (automatically checked on store creation) -->
{#if $submissionStatus.submitted}
  <div>
    Thank you! You already submitted: {$submissionStatus.email}
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <input type="email" name="email" required />
    <button type="submit" disabled={$loading}>
      {$loading ? 'Submitting...' : 'Submit'}
    </button>
    {#if $error}
      <p class="error">{$error}</p>
    {/if}
  </form>
{/if}
```

### Angular

```typescript
// app.config.ts or main.ts
import { LanorxService } from "@lanorx/tracking/angular";

export const appConfig = {
    providers: [LanorxService],
};

// app.component.ts
import { Component, OnInit } from "@angular/core";
import { LanorxService } from "@lanorx/tracking/angular";

@Component({
    selector: "app-root",
    template: "<app-email-form></app-email-form>",
})
export class AppComponent implements OnInit {
    constructor(private lanorx: LanorxService) {}

    ngOnInit() {
        this.lanorx.init({
            projectId: "your_project_id",
            apiKey: "your_api_key",
        });
    }
}

// email-form.component.ts
import { Component, OnInit } from "@angular/core";
import { LanorxService } from "@lanorx/tracking/angular";

@Component({
    selector: "app-email-form",
    template: `
        <div *ngIf="submitted">
            Thank you! You already submitted: {{ submittedEmail }}
        </div>

        <form *ngIf="!submitted" (ngSubmit)="onSubmit(emailInput.value)">
            <input #emailInput type="email" required />
            <button type="submit" [disabled]="loading">
                {{ loading ? "Submitting..." : "Submit" }}
            </button>
            <p *ngIf="error" class="error">{{ error }}</p>
        </form>
    `,
})
export class EmailFormComponent implements OnInit {
    submitted = false;
    submittedEmail = "";
    loading = false;
    error = "";

    constructor(private lanorx: LanorxService) {}

    ngOnInit() {
        // Check if user already submitted (automatically stored in localStorage)
        const status = this.lanorx.hasSubmittedEmail();
        this.submitted = status.submitted;
        this.submittedEmail = status.email || "";
    }

    async onCTAClick() {
        await this.lanorx.trackCTA("hero"); // section: 'header', 'hero', 'pricing', etc.
    }

    async onSubmit(email: string) {
        this.loading = true;
        this.error = "";

        const result = await this.lanorx.submitEmail({ email });
        // CONVERSION event is automatically created on server

        if (result.success) {
            this.submitted = true;
            this.submittedEmail = email;
        } else {
            this.error = result.error || "Failed to submit email";
        }

        this.loading = false;
    }
}
```

## API Reference

### `LanorxClient`

The core client for interacting with Lanorx API.

```typescript
const client = new LanorxClient({
    projectId: "your_project_id",
    apiKey: "your_api_key",
    apiUrl: "https://www.lanorx.com", // Optional, defaults to production
});
```

#### Methods

##### `hasSubmittedEmail()`

Check if user has already submitted an email for this project.

```typescript
const status = client.hasSubmittedEmail();
// Returns: { submitted: boolean, email?: string, submittedAt?: string }

if (status.submitted) {
    console.log("Already submitted:", status.email);
}
```

##### `submitEmail(options)`

Submit an email to your project. Device ID is automatically managed via localStorage. CONVERSION event is automatically created on the server.

```typescript
const result = await client.submitEmail({
    email: "user@example.com",
});

if (result.success) {
    console.log("Email submitted:", result.data);
    // result.data = { id, email, createdAt }
} else {
    console.error("Error:", result.error);
}
```

##### `trackCTA(section, contentId?)`

Track a CTA (Call-to-Action) click event. Device ID is automatically managed.

```typescript
await client.trackCTA("hero"); // section: 'header', 'hero', 'pricing', etc.
await client.trackCTA("pricing", "variant-a"); // with A/B testing variant
```

##### `trackPageView(contentId?)`

Track a page view event. Automatically includes referrer in metadata. Device ID is automatically managed.

```typescript
await client.trackPageView();
await client.trackPageView("variant-a"); // with A/B testing variant
```

##### `trackNavigate(meta?, contentId?)`

Track a navigation event (advanced).

```typescript
await client.trackNavigate({ from: "/home", to: "/pricing" });
await client.trackNavigate({ page: "/pricing" }, "variant-a");
```

##### `trackEvent(options)` (Low-level API)

Track a custom event with full control. This is a low-level API - prefer using dedicated methods for most use cases.

```typescript
await client.trackEvent({
    type: "VIEW", // 'VIEW' | 'CTA' | 'SUBMIT' | 'CONVERSION' | 'NAVIGATE'
    contentId: "variant-a", // Optional: for A/B testing
    meta: {
        // Optional: custom metadata
        section: "hero",
        button: "signup",
    },
});

// Note: All event types are supported, but prefer using:
// - trackPageView() for VIEW events
// - trackCTA() for CTA events
// - trackNavigate() for NAVIGATE events
// - CONVERSION events are auto-created on email submission
```

## React Integration

### `LanorxProvider`

Wrap your app with this provider to enable React hooks. Automatically tracks page view on mount.

```tsx
<LanorxProvider projectId="your_project_id" apiKey="your_api_key">
    <App />
</LanorxProvider>
```

### React Hooks

#### `useLanorx()`

Access the Lanorx client instance directly.

```tsx
const client = useLanorx();
await client.submitEmail({ email: "user@example.com" });
```

#### `useEmail()`

Hook for submitting emails with loading, error states, and automatic duplicate check.

```tsx
const {
    submitEmail, // Function to submit email
    hasSubmittedEmail, // Function to check submission
    submissionStatus, // { submitted, email?, submittedAt? } - auto-checked on mount
    loading, // boolean
    error, // string | null
} = useEmail();

// Check if already submitted (automatically checked on mount)
if (submissionStatus.submitted) {
    console.log("Already submitted:", submissionStatus.email);
}

const handleSubmit = async () => {
    const result = await submitEmail({
        email: "user@example.com",
    });

    if (result.success) {
        console.log("Success!");
    }
};
```

#### `useTracking()`

Hook for tracking events.

```tsx
const {
    trackCTA, // (section, contentId?) => Promise
    trackNavigate, // (meta?, contentId?) => Promise
} = useTracking();

// Track CTA click
await trackCTA("hero"); // section: 'header', 'hero', 'pricing', etc.
await trackCTA("pricing", "variant-a"); // with A/B testing

// Track navigation
await trackNavigate({ from: "/home", to: "/pricing" });
```

## Vue Integration

### `LanorxPlugin`

Install the plugin to enable Vue composables. Automatically tracks page view on app mount.

```typescript
import { LanorxPlugin } from "@lanorx/tracking/vue";

app.use(LanorxPlugin, {
    projectId: "your_project_id",
    apiKey: "your_api_key",
});
```

### Vue Composables

#### `useLanorx()`

Access the Lanorx client instance directly.

```typescript
const client = useLanorx();
await client.submitEmail({ email: "user@example.com" });
```

#### `useEmail()`

Composable for submitting emails with reactive state and automatic duplicate check.

```typescript
const {
    submitEmail, // Function to submit email
    hasSubmittedEmail, // Function to check submission
    submissionStatus, // Ref<{ submitted, email?, submittedAt? }> - auto-checked on mount
    loading, // Ref<boolean>
    error, // Ref<string | null>
} = useEmail();

// All values are reactive refs
```

#### `useTracking()`

Composable for tracking events with reactive state.

```typescript
const {
    trackCTA, // (section, contentId?) => Promise
    trackNavigate, // (meta?, contentId?) => Promise
    loading, // Ref<boolean>
    error, // Ref<string | null>
} = useTracking();
```

## Svelte Integration

### `initLanorx()`

Initialize the Lanorx client. Automatically tracks page view on initialization.

```typescript
import { initLanorx } from "@lanorx/tracking/svelte";

initLanorx({
    projectId: "your_project_id",
    apiKey: "your_api_key",
});
```

### Svelte Stores

#### `createEmailStore()`

Create an email store with reactive state and automatic duplicate check.

```typescript
const emailStore = createEmailStore();

// Reactive stores (use with $)
emailStore.loading; // Writable<boolean>
emailStore.error; // Writable<string | null>
emailStore.submissionStatus; // Writable<{ submitted, email?, submittedAt? }> - auto-checked on creation

// Methods
await emailStore.submitEmail({ email });
emailStore.hasSubmittedEmail();
```

#### `createTrackingStore()`

Create a tracking store with reactive state.

```typescript
const trackingStore = createTrackingStore();

// Reactive stores
trackingStore.loading  // Writable<boolean>
trackingStore.error    // Writable<string | null>

// Methods
await trackingStore.trackCTA(section, contentId?);
await trackingStore.trackNavigate(meta?, contentId?);
```

## Angular Integration

### `LanorxService`

Injectable service for Angular. Automatically tracks page view on initialization.

```typescript
import { LanorxService } from '@lanorx/tracking/angular';

// In your component
constructor(private lanorx: LanorxService) {}

ngOnInit() {
  this.lanorx.init({
    projectId: 'your_project_id',
    apiKey: 'your_api_key'
  });
}
```

### Service Methods

```typescript
// Check submission status
const status = this.lanorx.hasSubmittedEmail();

// Submit email
await this.lanorx.submitEmail({ email });

// Track CTA
await this.lanorx.trackCTA("hero", "variant-a");

// Track navigation
await this.lanorx.trackNavigate({ from: "/home" }, "variant-a");
```

## Event Types

-   `VIEW` - Page view (auto-tracked on initialization)
-   `CTA` - Call-to-action click
-   `SUBMIT` - Form submission
-   `CONVERSION` - Conversion event (auto-created on email submission)
-   `NAVIGATE` - Navigation event

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import type {
    LanorxConfig,
    EmailSubmitOptions,
    EventTrackOptions,
    EventType,
    ApiResponse,
} from "@lanorx/tracking";
```

## License

MIT © Dchool

## Links

-   [Documentation](https://www.lanorx.com/docs/api)
-   [GitHub](https://github.com/GecSchool/lanorx-tracking)
-   [NPM](https://www.npmjs.com/package/@lanorx/tracking)
