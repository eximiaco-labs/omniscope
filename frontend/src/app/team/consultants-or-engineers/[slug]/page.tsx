"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { ConsultantHeader } from "./ConsultantHeader";
import { QueryBuilderProvider } from "@/lib/graphql/QueryBuilderContext";
import { useQueryBuilder } from "@/lib/graphql/QueryBuilderContext";

function ConsultantPage() {
  return (
    <QueryBuilderProvider>
      <ConsultantPageInner />
    </QueryBuilderProvider>
  );
}

// Componente interno necessário porque useQueryBuilder precisa estar dentro do Provider
function ConsultantPageInner() {
  const params = useParams();
  const slug = params.slug as string;
  const { addVariables } = useQueryBuilder();

  // Add the slug variable to be used by all fragments
  React.useEffect(() => {
    addVariables({
      slug,
    });
  }, [addVariables, slug]);

  return (
    <div className="w-full">
      <ConsultantHeader />
    </div>
  );
}

export default ConsultantPage; 