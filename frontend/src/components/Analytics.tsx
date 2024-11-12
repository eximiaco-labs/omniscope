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
      
      trackEvent({
        event_name: 'page_view',
        event_category: 'navigation',
        event_action: 'view',
        event_label: pathname,
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        event_value: 1
      });
    }
  }, [pathname, searchParams, trackEvent]);

  return null;
} 