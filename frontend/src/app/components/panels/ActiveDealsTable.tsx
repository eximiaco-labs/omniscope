import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ActiveDeal {
  id: string;
  title: string;
  stageName: string;
}

interface ActiveDealsTableProps {
  deals: ActiveDeal[];
}

const ActiveDealsTable: React.FC<ActiveDealsTableProps> = ({ deals }) => {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal Title</TableHead>
            <TableHead>Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals?.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell>{deal.title}</TableCell>
              <TableCell>{deal.stageName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActiveDealsTable; 