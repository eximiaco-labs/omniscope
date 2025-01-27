"use client";

import { QueryBuilderProvider } from '@/lib/graphql/QueryBuilderContext';
import { ExampleContent } from './ExampleContent';

export default function ExamplePage() {
  return (
    <QueryBuilderProvider>
      <ExampleContent />
    </QueryBuilderProvider>
  );
} 