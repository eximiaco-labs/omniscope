import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSession } from 'next-auth/react';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { trackEvent } = useAnalytics();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      trackEvent({
        event_name: 'page_view',
        event_category: 'navigation',
        event_action: 'view',
        event_label: pathname,
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        event_value: 1,
        environment: isLocalhost ? 'development' : 'production'
      });
    }
  }, [pathname, searchParams, trackEvent]);

  return null;
} 