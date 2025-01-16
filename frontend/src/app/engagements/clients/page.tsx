"use client";

import { useState } from "react";
import { Badge } from "@/components/catalyst/badge";
import { Heading } from "@/components/catalyst/heading";
import { useQuery } from "@apollo/client";
import { Stat } from "@/app/components/analytics/stat";
import { Divider } from "@/components/catalyst/divider";
import { motion, AnimatePresence } from "framer-motion";
import { GET_CLIENTS } from "./queries";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ClientStatsSection from "../../components/ClientStatsSection";
import { ClientGallery } from "./ClientGallery";

export default function Clients() {
  const { loading, error, data } = useQuery(GET_CLIENTS, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>("allClients");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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

  return (
    <>
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
