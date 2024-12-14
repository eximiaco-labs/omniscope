import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { useState } from "react";

const GET_CACHE_QUERY = gql`
  query GetCache {
    cache {
      key
      createdAt
    }
  }
`;

const INVALIDATE_CACHE_MUTATION = gql`
  mutation InvalidateCache($key: String!) {
    invalidateCache(key: $key)
  }
`;

export function OmniHitRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const pathname = usePathname();
  const { data: cacheData, refetch } = useQuery(GET_CACHE_QUERY);
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);

  const getCacheKey = (path: string): string | null => {
    if (path.includes("clients")) return "clients";
    if (path.includes("consultants-and-engineers")) return "workers";
    if (path.includes("account-managers")) return "workers";
    if (path.includes("cases")) return "cases";
    if (path.includes("products-or-services")) return "offers";
    return null;
  };

  const cacheKey = getCacheKey(pathname);
  
  // If no valid cache key is found, don't render anything
  if (!cacheKey) return null;
  
  const cacheInfo = cacheData?.cache?.find((item: { key: string }) => item.key === cacheKey);

  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo'
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateCache({ variables: { key: cacheKey } });
      const { data: newData } = await refetch();
      if (newData) {
        window.location.reload();
        toast.success("Data refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to refresh data");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex justify-end items-center gap-2 py-1 text-xs text-muted-foreground">
      <span>Last updated: {formatLastUpdated(cacheInfo?.createdAt)}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

