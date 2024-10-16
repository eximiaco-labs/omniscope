import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const GET_INCONSISTENCIES = gql`
  query GetInconsistencies {
    inconsistencies {
      title
      description
    }
  }
`;

export function InconsistencyAlerts() {
  const { loading, error, data } = useQuery(GET_INCONSISTENCIES);

  if (loading) return null;
  if (error) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Error fetching inconsistencies</AlertDescription>
    </Alert>
  );

  return (
    <AnimatePresence>
      {data.inconsistencies.map((inconsistency: { title: string; description: string }, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{inconsistency.title}</AlertTitle>
            <AlertDescription>{inconsistency.description}</AlertDescription>
          </Alert>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
