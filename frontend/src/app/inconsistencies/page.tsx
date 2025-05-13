'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const GET_INCONSISTENCES = gql`
  query GetInconsistencies {
    admin {
      inconsistencies {
        data {
          kind
          description
          entityKind
          entity
        }
      }
    }
  }
`;

export default function InconsistencesPage() {
  const { loading, error, data } = useQuery(GET_INCONSISTENCES);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const inconsistences = data?.admin?.inconsistences?.data || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Inconsistencies</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inconsistences.map((inconsistence: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{inconsistence.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{inconsistence.kind}</Badge>
                </TableCell>
                <TableCell>{inconsistence.entityKind}</TableCell>
                <TableCell>{inconsistence.entity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
