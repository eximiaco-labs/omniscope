import { motion, AnimatePresence } from "framer-motion";
import { CaseCard } from "./CaseCard";

interface CasesGalleryProps {
  filteredCases: any[];
  timesheetData: any;
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
        {filteredCases.map((caseItem: any) => (
          <motion.div
            key={caseItem.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <CaseCard
              caseItem={caseItem}
              caseData={timesheetData.byCase.find(
                (c: any) => c.title === caseItem.title
              )}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
} 