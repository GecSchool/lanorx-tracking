# @lanorx/tracking

Official JavaScript SDK for Lanorx - Email collection and event tracking for landing pages.

## Features

- 📧 **Email Collection** - Capture emails from your landing pages
- 📊 **Event Tracking** - Track user interactions and page views
- 🎯 **Multi-Framework** - React, Vue, Svelte, Angular support
- 🪶 **Lightweight** - Zero dependencies (frameworks are optional peer dependencies)
- 🔒 **Type Safe** - Written in TypeScript with full type definitions
- ⚡ **Fast** - Optimized builds with tree-shaking support

## Installation

```bash
npm install @lanorx/tracking
```

## Quick Start

### Vanilla JavaScript

```typescript
import { LanorxClient } from '@lanorx/tracking';

const client = new LanorxClient({
  projectId: 'proj_123',
  apiKey: 'lnx_sk_...'
});

// Submit an email
await client.submitEmail({
  email: 'user@example.com'
});

// Track an event
await client.trackEvent({
  type: 'CTA',
  meta: { button: 'signup' }
});

// Track page view
await client.trackPageView();
```

### React

```tsx
import { LanorxProvider, EmailForm, useTracking } from '@lanorx/tracking/react';

function App() {
  return (
    <LanorxProvider projectId="proj_123" apiKey="lnx_sk_...">
      <YourApp />
    </LanorxProvider>
  );
}

function YourApp() {
  const { trackEvent } = useTracking();

  return (
    <div>
      <EmailForm
        placeholder="Enter your email"
        buttonText="Subscribe"
        onSuccess={(data) => console.log('Email submitted:', data)}
        onError={(error) => console.error('Error:', error)}
      />

      <button onClick={() => trackEvent({ type: 'CTA' })}>
        Click me
      </button>
    </div>
  );
}
```

### Vue

```typescript
import { createApp } from 'vue';
import { LanorxPlugin, useEmail, useTracking } from '@lanorx/tracking/vue';

const app = createApp(App);

app.use(LanorxPlugin, {
  projectId: 'proj_123',
  apiKey: 'lnx_sk_...'
});

// In your component
const { submitEmail } = useEmail();
const { trackEvent } = useTracking();

await submitEmail({ email: 'user@example.com' });
await trackEvent({ type: 'CTA' });
```

### Svelte

```typescript
import { initLanorx, createEmailStore, createTrackingStore } from '@lanorx/tracking/svelte';

initLanorx({
  projectId: 'proj_123',
  apiKey: 'lnx_sk_...'
});

const emailStore = createEmailStore();
const trackingStore = createTrackingStore();

await emailStore.submitEmail({ email: 'user@example.com' });
await trackingStore.trackEvent({ type: 'CTA' });
```

## API Reference

### `LanorxClient`

The core client for interacting with Lanorx API.

```typescript
const client = new LanorxClient({
  projectId: 'proj_123',
  apiKey: 'lnx_sk_...',
  apiUrl: 'https://lanorx.com' // Optional, defaults to production
});
```

#### Methods

##### `submitEmail(options)`

Submit an email to your project.

```typescript
const result = await client.submitEmail({
  email: 'user@example.com',
  deviceId: 'optional-device-id' // Optional
});

if (result.success) {
  console.log('Email submitted:', result.data);
} else {
  console.error('Error:', result.error);
}
```

##### `trackEvent(options)`

Track a custom event.

```typescript
await client.trackEvent({
  type: 'CTA', // 'VIEW' | 'CTA' | 'SUBMIT' | 'CONVERSION' | 'NAVIGATE'
  contentId: 'variant-a', // Optional: for A/B testing
  deviceId: 'device-123', // Optional
  meta: { // Optional: custom metadata
    button: 'signup',
    page: '/landing'
  }
});
```

##### `trackPageView(deviceId?)`

Track a page view event.

```typescript
await client.trackPageView('device-123');
```

## React Components

### `LanorxProvider`

Wrap your app with this provider to enable React components and hooks.

```tsx
<LanorxProvider
  projectId="proj_123"
  apiKey="lnx_sk_..."
  apiUrl="https://lanorx.com" // Optional
>
  <App />
</LanorxProvider>
```

### `EmailForm`

Pre-built email submission form component.

```tsx
<EmailForm
  placeholder="Enter your email"
  buttonText="Subscribe"
  deviceId="device-123" // Optional
  onSuccess={(data) => console.log(data)}
  onError={(error) => console.error(error)}
  className="form-container"
  inputClassName="email-input"
  buttonClassName="submit-button"
/>
```

## React Hooks

### `useLanorx()`

Access the Lanorx client instance.

```tsx
const client = useLanorx();
await client.submitEmail({ email: 'user@example.com' });
```

### `useEmail()`

Hook for submitting emails with loading and error states.

```tsx
const { submitEmail, loading, error } = useEmail();

const handleSubmit = async () => {
  const result = await submitEmail({
    email: 'user@example.com'
  });

  if (result.success) {
    console.log('Success!');
  }
};
```

### `useTracking()`

Hook for tracking events with loading and error states.

```tsx
const { trackEvent, trackPageView, loading, error } = useTracking();

const handleClick = async () => {
  await trackEvent({
    type: 'CTA',
    meta: { button: 'signup' }
  });
};

// Track page view on mount
useEffect(() => {
  trackPageView();
}, []);
```

## Event Types

- `VIEW` - Page view
- `CTA` - Call-to-action click
- `SUBMIT` - Form submission
- `CONVERSION` - Conversion event
- `NAVIGATE` - Navigation event

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import type {
  LanorxConfig,
  EmailSubmitOptions,
  EventTrackOptions,
  EventType,
  ApiResponse,
} from '@lanorx/tracking';
```

## License

MIT © Dchool

## Links

- [Documentation](https://lanorx.com/docs)
- [GitHub](https://github.com/yourusername/lanorx-tracking)
- [NPM](https://www.npmjs.com/package/@lanorx/tracking)
