"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Divider } from "@/components/catalyst/divider";
import ClientStatsSection from "../../components/ClientStatsSection";
import { ClientGallery } from "./ClientGallery";
import { GET_CLIENTS } from "./queries";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Clients() {
  const { loading, error, data } = useQuery(GET_CLIENTS, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>("allClients");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredClients = data.clients.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const strategicClients = filteredClients.filter(
    (client: any) => client.isStrategic
  );
  const nonStrategicClients = filteredClients.filter(
    (client: any) => !client.isStrategic
  );

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName);
  };

  return (
    <>
      <ClientStatsSection
        data={data}
        selectedStat={selectedStat}
        onStatClick={handleStatClick}
      />
      <Divider className="my-8" />
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
    </>
  );
}
