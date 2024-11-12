import { useSession } from 'next-auth/react';

interface AnalyticsEvent {
  event_name: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  page_path?: string;
  environment?: 'development' | 'production';
  user_data?: {
    email?: string;
    name?: string;
    role?: string;
  };
  client_data?: {
    userAgent?: string;
    language?: string;
    screenResolution?: string;
    viewportSize?: string;
  };
  performance_data?: {
    loadTime?: number;
    domContentLoaded?: number;
    firstContentfulPaint?: number;
  };
}

export const useAnalytics = () => {
  const { data: session } = useSession();

  const getPerformanceData = () => {
    if (typeof window === 'undefined') return {};
    
    const navigation = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = window.performance?.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');

    return {
      loadTime: navigation?.loadEventEnd - navigation?.startTime,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.startTime,
      firstContentfulPaint: paint?.startTime
    };
  };

  const getClientData = () => {
    if (typeof window === 'undefined') return {};

    return {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  };

  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          user_data: {
            email: session?.user?.email,
            name: session?.user?.name,
          },
          client_data: getClientData(),
          performance_data: getPerformanceData(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  return { trackEvent };
}; 