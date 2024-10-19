import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table';
import { Heading } from '@/components/catalyst/heading';

interface AllocationAnalysis {
  status: number;
  worker?: string;
  client?: string;
  mean: number;
  current: number;
}

interface AllocationAnalysisTablesProps {
  byWorker: AllocationAnalysis[];
  byClient: AllocationAnalysis[];
}

const AllocationAnalysisTable: React.FC<{ data: AllocationAnalysis[], title: string, type: 'worker' | 'client' }> = ({ data, title, type }) => {
  return (
    <div className="mb-8">
      <Heading level={2} className="mb-4">{title} Allocation Analysis</Heading>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader className="w-16 text-center">Status</TableHeader>
            <TableHeader>{title}</TableHeader>
            <TableHeader className="text-right">Mean</TableHeader>
            <TableHeader className="text-right">Current</TableHeader>
            <TableHeader className="text-right">Difference %</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => {
            const percentDiff = item.mean === 0 ? 100 : ((item.current - item.mean) / item.mean) * 100;
            const isNew = item.mean === 0;
            const isInactive = item.current === 0;
            
            return (
              <TableRow 
                key={index}
                className={`
                  ${isNew ? 'bg-green-100 dark:bg-green-900' : ''}
                  ${isInactive ? 'bg-red-100 dark:bg-red-900' : ''}
                `}
              >
                <TableCell className="text-center">
                  {item.status > 0 && <span className="text-green-600 dark:text-green-400">▲</span>}
                  {item.status < 0 && <span className="text-red-600 dark:text-red-400">▼</span>}
                  {item.status === 0 && <span className="text-gray-400">-</span>}
                </TableCell>
                <TableCell>{item[type]}</TableCell>
                <TableCell className="text-right">{item.mean.toFixed(2)}</TableCell>
                <TableCell className="text-right">{item.current.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={percentDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(2)}%
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const AllocationAnalysisTables: React.FC<AllocationAnalysisTablesProps> = ({ byWorker, byClient }) => {
  return (
    <div className="space-y-12">
      <AllocationAnalysisTable data={byWorker} title="Worker" type="worker" />
      <AllocationAnalysisTable data={byClient} title="Client" type="client" />
    </div>
  );
};

export default AllocationAnalysisTables;
