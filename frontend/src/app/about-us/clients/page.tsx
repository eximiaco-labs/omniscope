"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Divider } from "@/components/catalyst/divider";
import ClientStatsSection from "../../components/ClientStatsSection";
import { ClientGallery } from "./ClientGallery";
import { GET_CLIENTS } from "./queries";

export default function Clients() {
  const { loading, error, data } = useQuery(GET_CLIENTS, { ssr: true });
  const [selectedStat, setSelectedStat] = useState<string>("allClients");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const strategicClients = data.clients.filter(
    (client: any) => client.isStrategic
  );
  const nonStrategicClients = data.clients.filter(
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
