import { motion, AnimatePresence } from "framer-motion";
import { CaseCard } from "./CaseCard";

interface Case {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  preContractedValue: boolean;
  sponsor: {
    name: string;
  };
  hasDescription: boolean;
  startOfContract: string;
  endOfContract: string;
  weeklyApprovedHours: number;
  client: {
    name: string;
  };
  isStale: boolean;
  updates: {
    data: Array<{
      date: string;
      status: string;
      author: string;
    }>;
  };
  timesheet: {
    summary: {
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    };
    byWeek: {
      data: Array<{
        week: string;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      }>;
    };
  };
}

interface CasesGalleryProps {
  filteredCases: Case[];
  timesheetData: {
    summary: {
      uniqueCases: number;
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
    filterableFields: Array<{
      field: string;
      options: string[];
      selectedValues: string[];
    }>;
  };
}

export function CasesGallery({ filteredCases, timesheetData }: CasesGalleryProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {filteredCases.map((caseItem) => (
          <motion.div
            key={caseItem.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <CaseCard caseItem={caseItem} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
} 