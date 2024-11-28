import React from 'react';
import { Stat } from "@/app/components/analytics/stat";
import SectionHeader from "@/components/SectionHeader";

interface ClientStatsSectionProps {
  data: any | null;
  selectedStat: string | null;
  onStatClick?: (statName: string) => void;
}

const ClientStatsSection: React.FC<ClientStatsSectionProps> = ({ data, selectedStat, onStatClick }) => {
  if (!data) {
    return <div>No data available</div>;
  }

  const getStatClassName = (statName: string) => {
    return `cursor-pointer transition-all duration-300 ${
      selectedStat === statName ? 'ring-2 ring-black shadow-lg scale-105' : 'hover:scale-102'
    }`;
  };

  const handleStatClick = (statName: string) => {
    if (onStatClick) {
      onStatClick(statName);
    }
  };

  const renderStat = (statName: string, title: string, value: string, color?: string, total?: number) => (
    <div
      className={`${getStatClassName(statName)} transform`}
      onClick={() => handleStatClick(statName)}
    >
      <Stat
        title={title}
        value={value}
        color={color}
        total={total}
      />
    </div>
  );

  const stats = [
    { name: 'total', title: 'Active Clients', value: data.timesheet?.uniqueClients?.toString() ?? '0' },
    { name: 'consulting', title: 'Consulting', value: data.timesheet?.byKind?.consulting?.uniqueClients?.toString() ?? '0', color: '#F59E0B' },
    { name: 'handsOn', title: 'Hands-On', value: data.timesheet?.byKind?.handsOn?.uniqueClients?.toString() ?? '0', color: '#8B5CF6' },
    { name: 'squad', title: 'Squad', value: data.timesheet?.byKind?.squad?.uniqueClients?.toString() ?? '0', color: '#3B82F6' },
    { name: 'internal', title: 'Internal', value: data.timesheet?.byKind?.internal?.uniqueClients?.toString() ?? '0', color: '#10B981' },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      <div className="col-span-6">
        <div className={`grid grid-cols-1 ${data.clients ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
          {data.clients && (
            <div className="lg:col-span-1">
              <SectionHeader title="All Time" subtitle="" />
              {renderStat('allClients', 'All Clients', data.clients.length.toString())}
            </div>
          )}
          <div className={data.clients ? 'lg:col-span-5' : 'lg:col-span-6'}>
            <SectionHeader title="Active" subtitle="Last Six Weeks" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {stats.map(stat => renderStat(stat.name, stat.title, stat.value, stat.color, data.timesheet?.uniqueClients))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientStatsSection;
