"use client";

import { Heading } from "@/components/catalyst/heading";
import { motion, AnimatePresence } from "framer-motion";
import ClientCard from "./ClientCard";
import SectionHeader from "@/components/SectionHeader";

interface ClientGalleryProps {
  clients: {
    name: string;
    logoUrl: string;
    slug: string;
    timesheet: {
      summary: {
        totalHours: number;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      };
      byWeek: {
        data: {
          week: string;
          totalConsultingHours: number;
          totalHandsOnHours: number;
          totalSquadHours: number;
          totalInternalHours: number;
        }[];
      };
    };
    activeCases: {
      data: {
        title: string;
        startOfContract: string;
        endOfContract: string;
        weeklyApprovedHours: number;
        preContractedValue: number;
      }[];
    };
  }[];
  title: string;
  selectedStat: string;
  timesheetData: {
    summary: {
      uniqueClients: number;
    };
    byKind: {
      consulting: {
        uniqueClients: number;
      };
      handsOn: {
        uniqueClients: number;
      };
      squad: {
        uniqueClients: number;
      };
      internal: {
        uniqueClients: number;
      };
    };
  };
}

export function ClientGallery({
  clients,
  title,
  selectedStat,
  timesheetData,
}: ClientGalleryProps) {
  // Compute weekly approved hours for each client
  const clientsWithApprovedHours = clients.map((client) => {
    const activeWeeklyHours = client.activeCases.data
      .filter((c) => {
        const now = new Date();
        const sixWeeksAgo = new Date(now.setDate(now.getDate() - 42)); // 6 weeks ago
        const start = new Date(c.startOfContract);
        const end = c.endOfContract ? new Date(c.endOfContract) : new Date();
        return start <= now && end >= sixWeeksAgo;
      })
      .reduce((sum, c) => sum + (c.weeklyApprovedHours || 0), 0);

    return {
      ...client,
      clientData: {
        ...client.timesheet.summary,
        weeklyApprovedHours: activeWeeklyHours,
        byWeek: client.timesheet.byWeek.data
      }
    };
  });

  const filteredClients = clients.filter((client) => {
    const { summary } = client.timesheet;
    if (!summary) return selectedStat === "allClients";
    switch (selectedStat) {
      case "total":
        return summary.totalHours > 0;
      case "consulting":
        return summary.totalConsultingHours > 0;
      case "handsOn":
        return summary.totalHandsOnHours > 0;
      case "squad":
        return summary.totalSquadHours > 0;
      case "internal":
        return summary.totalInternalHours > 0;
      default:
        return true;
    }
  });

  if (filteredClients.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <SectionHeader
        title={title}
        subtitle={`${filteredClients.length} clients`}
      />
      <div className="px-2">
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
                  clientData={
                    clientsWithApprovedHours.find((c) => c.name === client.name)
                      ?.clientData
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
