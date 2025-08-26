import posthog from 'posthog-js';

// PostHog configuration
export const initPostHog = () => {
  // You'll need to replace this with your actual PostHog project API key
  const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY || 'your-posthog-api-key';
  const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  if (typeof window !== 'undefined' && POSTHOG_API_KEY !== 'your-posthog-api-key') {
    try {
      posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_HOST,
        // Enable session recording (optional)
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        },
        // Capture pageviews automatically
        capture_pageview: false, // We'll handle this manually for better control
        // Enable feature flags
        bootstrap: {
          featureFlags: {},
        },
      });
    } catch (error) {
      console.warn('PostHog initialization failed:', error);
    }
  } else if (POSTHOG_API_KEY === 'your-posthog-api-key') {
    console.warn('PostHog not initialized: Please set VITE_POSTHOG_API_KEY environment variable');
  }

  return posthog;
};

// Analytics helper functions
export const analytics = {
  // Page tracking
  page: (pageName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        ...properties,
      });
    }
  },

  // Event tracking
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture(eventName, properties);
    }
  },

  // User identification
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.setPersonProperties(properties);
    }
  },

  // Reset user (for logout)
  reset: () => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.reset();
    }
  },

  // Feature flags
  isFeatureEnabled: (flagKey: string): boolean => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      return posthog.isFeatureEnabled(flagKey) || false;
    }
    return false;
  },

  getFeatureFlag: (flagKey: string) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      return posthog.getFeatureFlag(flagKey);
    }
    return undefined;
  },
};

export default posthog;
