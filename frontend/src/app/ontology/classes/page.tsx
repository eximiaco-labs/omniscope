"use client";

import { gql, useQuery } from "@apollo/client";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const GET_ONTOLOGY_CLASSES = gql`
  query GetOntologyClasses {
    ontology {
      classes {
        data {
          slug
          name
          description
        }
      }
    }
  }
`;

type OntologyClass = {
  slug: string;
  name: string;
  description: string;
};

type QueryResult = {
  ontology: {
    classes: {
      data: OntologyClass[];
    };
  };
};

export default function OntologyClassesPage() {
  const client = useEdgeClient();
  
  if (!client) return <div>Error: Edge client not available</div>;

  const { data, loading, error } = useQuery<QueryResult>(GET_ONTOLOGY_CLASSES, {
    client,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const classes = data?.ontology.classes.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ontology Classes</h1>
      <div className="grid gap-4">
        {classes.map((cls) => (
          <div key={cls.slug} className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold">{cls.name}</h2>
            <p className="text-gray-600 mt-2">{cls.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
