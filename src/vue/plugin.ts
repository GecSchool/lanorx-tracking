import { LanorxClient } from "../core/client";
import type { LanorxConfig } from "../core/types";
import type { App, Plugin } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $lanorx: LanorxClient;
  }
}

export interface LanorxPluginOptions extends LanorxConfig {
  autoTrackPageView?: boolean; // Default: true
}

export const LanorxPlugin: Plugin = {
  install(app: App, options: LanorxPluginOptions) {
    const { autoTrackPageView = true, ...config } = options;
    const client = new LanorxClient(config);

    app.config.globalProperties.$lanorx = client;
    app.provide("lanorx", client);

    // Auto-track page view on app mount
    if (autoTrackPageView) {
      app.mixin({
        mounted() {
          // Only track once when root component mounts
          if (this.$root === this) {
            client.trackPageView();
          }
        },
      });
    }
  },
};
