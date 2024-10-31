"use client";

import { Heading } from "@/components/catalyst/heading";
import { motion, AnimatePresence } from "framer-motion";
import ClientCard from "./ClientCard";

interface ClientGalleryProps {
  clients: {
    name: string;
    logoUrl: string;
    slug: string;
  }[];
  title: string;
  selectedStat: string;
  timesheetData: {
    byClient: {
      name: string;
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      weeklyApprovedHours?: number;
      byWeek?: {
        week: string;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      }[];
    }[];
  };
  cases: {
    startOfContract: string;
    endOfContract: string;
    weeklyApprovedHours: number;
    client: {
      name: string;
    } | null;
  }[];
}

export function ClientGallery({
  clients,
  title,
  selectedStat,
  timesheetData,
  cases,
}: ClientGalleryProps) {
  // Function to check if a case is active in the last 6 weeks
  const isActiveInLastSixWeeks = (startDate: string, endDate: string) => {
    const now = new Date();
    const sixWeeksAgo = new Date(now.setDate(now.getDate() - 42)); // 6 weeks ago
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    return start <= now && end >= sixWeeksAgo;
  };

  // Compute weekly approved hours for each client
  const clientsWithApprovedHours = clients.map(client => {
    const clientCases = cases.filter(c => c.client?.name === client.name);
    const activeWeeklyHours = clientCases
      .filter(c => isActiveInLastSixWeeks(c.startOfContract, c.endOfContract))
      .reduce((sum, c) => sum + (c.weeklyApprovedHours || 0), 0);

    const clientData = timesheetData.byClient.find(c => c.name === client.name);
    return {
      ...client,
      clientData: clientData ? {
        ...clientData,
        weeklyApprovedHours: activeWeeklyHours
      } : undefined
    };
  });

  const filteredClients = clients.filter((client) => {
    const clientData = timesheetData.byClient.find(
      (c) => c.name === client.name
    );
    if (!clientData) return selectedStat === "allClients";
    switch (selectedStat) {
      case "total":
        return clientData.totalHours > 0;
      case "consulting":
        return clientData.totalConsultingHours > 0;
      case "handsOn":
        return clientData.totalHandsOnHours > 0;
      case "squad":
        return clientData.totalSquadHours > 0;
      case "internal":
        return clientData.totalInternalHours > 0;
      default:
        return true;
    }
  });

  if (filteredClients.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Heading level={3} className="text-xl font-semibold text-gray-800">
          {title}
        </Heading>
        <span className="text-sm font-medium text-gray-600">
          {filteredClients.length} clients
        </span>
      </div>
      <AnimatePresence>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {filteredClients.map((client) => (
            <motion.div
              key={client.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ClientCard 
                client={client} 
                clientData={clientsWithApprovedHours.find(
                  c => c.name === client.name
                )?.clientData}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
