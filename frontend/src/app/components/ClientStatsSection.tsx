import React from 'react';
import { Stat } from "@/app/components/analytics/stat";

interface ClientStatsSectionProps {
  data: any;
  selectedStat: string;
  onStatClick?: (statName: string) => void;
}

const ClientStatsSection: React.FC<ClientStatsSectionProps> = ({ data, selectedStat, onStatClick }) => {
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
    { name: 'total', title: 'Active Clients', value: data.timesheet.uniqueClients.toString() },
    { name: 'consulting', title: 'Consulting', value: data.timesheet.byKind.consulting.uniqueClients.toString(), color: '#F59E0B' },
    { name: 'handsOn', title: 'Hands-On', value: data.timesheet.byKind.handsOn.uniqueClients.toString(), color: '#8B5CF6' },
    { name: 'squad', title: 'Squad', value: data.timesheet.byKind.squad.uniqueClients.toString(), color: '#3B82F6' },
    { name: 'internal', title: 'Internal', value: data.timesheet.byKind.internal.uniqueClients.toString(), color: '#10B981' },
  ];

  const selectedStatIndex = stats.findIndex(stat => stat.name === selectedStat);
  if (selectedStatIndex !== -1) {
    const selectedStat = stats.splice(selectedStatIndex, 1)[0];
    stats.unshift(selectedStat);
  }

  return (
    <div className="grid grid-cols-6 gap-4 mb-8">
      <div className="col-span-6">
        <div className={`grid grid-cols-1 ${data.clients ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
          {data.clients && (
            <div className="lg:col-span-1">
              <div className="flex items-center mb-3">
                <p className="text-sm font-semibold text-gray-900 uppercase">
                  ALL TIME
                </p>
                <div className="flex-grow h-px bg-gray-200 ml-2"></div>
              </div>
              {renderStat('allClients', 'All Clients', data.clients.length.toString())}
            </div>
          )}
          <div className={data.clients ? 'lg:col-span-5' : 'lg:col-span-6'}>
            <div className="flex items-center mb-3">
              <p className="text-sm font-semibold text-gray-900 uppercase">
                ACTIVE <span className="text-xs text-gray-600 uppercase">LAST SIX WEEKS</span>
              </p>
              <div className="flex-grow h-px bg-gray-200 ml-2"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {stats.map(stat => renderStat(stat.name, stat.title, stat.value, stat.color, data.timesheet.uniqueClients))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientStatsSection;
