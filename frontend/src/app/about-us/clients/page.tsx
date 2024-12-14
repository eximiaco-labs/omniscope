"use client";

import { useState } from "react";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { GET_CLIENTS } from "./queries";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ClientStatsSection from "../../components/ClientStatsSection";
import { ClientGallery } from "./ClientGallery";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const INVALIDATE_CACHE_MUTATION = gql`
  mutation InvalidateCache($key: String!) {
    invalidateCache(key: $key)
  }
`;

const GET_CACHE_QUERY = gql`
  query GetCache {
    cache {
      key
      createdAt
    }
  }
`;

export default function Clients() {
  const { loading, error, data, refetch } = useQuery(GET_CLIENTS, { ssr: true });
  const { data: cacheData } = useQuery(GET_CACHE_QUERY);
  const [invalidateCache] = useMutation(INVALIDATE_CACHE_MUTATION);
  const [selectedStat, setSelectedStat] = useState<string>("allClients");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateCache({ variables: { key: "clients" } });
      const { data: newData } = await refetch();
      if (newData) {
        window.location.reload();
        toast.success("Client data refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to refresh client data");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  const filteredClients = data.clients.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const strategicClients = filteredClients.filter(
    (client: any) => client.isStrategic
  );
  const nonStrategicClients = filteredClients.filter(
    (client: any) => !client.isStrategic
  );

  const clientsCacheInfo = cacheData?.cache?.find((item: { key: string; }) => item.key === "clients");
  
  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo'
    });
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 py-1 text-xs text-muted-foreground">
        <span>Last updated: {formatLastUpdated(clientsCacheInfo?.createdAt)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <ClientStatsSection
            data={data}
            selectedStat={selectedStat}
            onStatClick={handleStatClick}
          />
        </div>
      </div>
      <div className="px-2">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ClientGallery 
              clients={strategicClients} 
              title="Strategic Clients" 
              selectedStat={selectedStat}
              timesheetData={data.timesheet}
              cases={data.cases}
            />
            <ClientGallery 
              clients={nonStrategicClients} 
              title="Other Clients" 
              selectedStat={selectedStat}
              timesheetData={data.timesheet}
              cases={data.cases}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
