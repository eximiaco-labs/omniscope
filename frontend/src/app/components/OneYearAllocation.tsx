import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { STAT_COLORS } from '../constants/colors';

interface ContributionProps {
  month?: number;
  year?: number;
}

const ALLOCATION_QUERY = gql`
  query AllocationOfYear($startDate: Date!, $endDate: Date!, $filters: [FilterInput!]) {
    allocation(startDate: $startDate, endDate: $endDate, filters: $filters) {
      byKind {
        consulting {
          date
          hours
        }
        handsOn {
          date
          hours
        }
        squad {
          date
          hours
        }
        internal {
          date
          hours
        }
      }
    }
  }
`;

const OneYearAllocation: React.FC<ContributionProps> = ({ month, year }) => {
  // If no month specified, use January (1)
  const currentDate = new Date();
  const specifiedMonth = month || currentDate.getMonth() + 1; // getMonth() returns 0-11
  const specifiedYear = year || currentDate.getFullYear();

  // Calculate end date (last day of specified month/year)
  const endDate = new Date(specifiedYear, specifiedMonth, 0);
  
  // Calculate start date (first day, 11 months before specified month/year)
  // Handle negative months by adjusting the year
  const startMonth = specifiedMonth - 12;
  const yearAdjustment = Math.floor(startMonth / 12);
  const adjustedStartMonth = startMonth < 1 ? startMonth + 12 : startMonth;
  const startDate = new Date(specifiedYear + yearAdjustment, adjustedStartMonth, 1);

  const { loading, error, data } = useQuery(ALLOCATION_QUERY, {
    variables: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      filters: null // Changed to null since it's optional
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Calculate total hours for each kind
  const totals = {
    consulting: 0,
    handsOn: 0,
    squad: 0,
    internal: 0
  };

  if (data?.allocation?.byKind) {
    Object.entries(data.allocation.byKind).forEach(([kind, entries]) => {
      if (Array.isArray(entries) && kind in totals) {
        totals[kind as keyof typeof totals] = entries.reduce((sum, entry) => sum + entry.hours, 0);
      }
    });
  }

  return (
    <div>
      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.consulting}20` }}>
              <h3 className="font-semibold">Consulting</h3>
              <p>{totals.consulting.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.handsOn}20` }}>
              <h3 className="font-semibold">Hands On</h3>
              <p>{totals.handsOn.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.squad}20` }}>
              <h3 className="font-semibold">Squad</h3>
              <p>{totals.squad.toFixed(1)}h</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${STAT_COLORS.internal}20` }}>
              <h3 className="font-semibold">Internal</h3>
              <p>{totals.internal.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      )}
      {data && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border text-sm font-medium">Day</th>
                {(() => {
                  const weeks = [];
                  let currentDate = new Date(startDate);
                  
                  while (currentDate <= endDate) {
                    weeks.push(
                      <th key={currentDate.toISOString()} className="p-2 border text-sm font-medium">
                        {currentDate.toLocaleString('en', { month: 'short' })} W{Math.ceil(currentDate.getDate() / 7)}
                      </th>
                    );
                    
                    // Move to next week
                    currentDate.setDate(currentDate.getDate() + 7);
                  }
                  return weeks;
                })()}
              </tr>
            </thead>
            <tbody>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <tr key={day}>
                  <td className="p-2 border text-sm font-medium">{day}</td>
                  {(() => {
                    const cells = [];
                    let currentDate = new Date(startDate);
                    
                    while (currentDate <= endDate) {
                      cells.push(
                        <td key={currentDate.toISOString()} className="p-2 border"></td>
                      );
                      
                      // Move to next week
                      currentDate.setDate(currentDate.getDate() + 7);
                    }
                    return cells;
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OneYearAllocation;
