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

  return (
    <div className="grid grid-cols-6 gap-4 mb-8">
      <div className="col-span-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-3">
              <p className="text-sm font-semibold text-gray-900 uppercase">
                ALL TIME
              </p>
              <div className="flex-grow h-px bg-gray-200 ml-2"></div>
            </div>
            <div
              className={`${getStatClassName('allClients')} transform`}
              onClick={() => handleStatClick('allClients')}
            >
              <Stat
                title="All Clients"
                value={data.clients.length.toString()}
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="flex items-center mb-3">
              <p className="text-sm font-semibold text-gray-900 uppercase">
                ACTIVE <span className="text-xs text-gray-600 uppercase">LAST SIX WEEKS</span>
              </p>
              <div className="flex-grow h-px bg-gray-200 ml-2"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div
                className={`${getStatClassName('total')} transform`}
                onClick={() => handleStatClick('total')}
              >
                <Stat
                  title="Active Clients"
                  value={data.timesheet.uniqueClients.toString()}
                />
              </div>
              <div
                className={`${getStatClassName('consulting')} transform`}
                onClick={() => handleStatClick('consulting')}
              >
                <Stat
                  title="Consulting"
                  value={data.timesheet.byKind.consulting.uniqueClients.toString()}
                  color="#F59E0B"
                  total={data.timesheet.uniqueClients}
                />
              </div>
              <div
                className={`${getStatClassName('handsOn')} transform`}
                onClick={() => handleStatClick('handsOn')}
              >
                <Stat
                  title="Hands-On"
                  value={data.timesheet.byKind.handsOn.uniqueClients.toString()}
                  color="#8B5CF6"
                  total={data.timesheet.uniqueClients}
                />
              </div>
              <div
                className={`${getStatClassName('squad')} transform`}
                onClick={() => handleStatClick('squad')}
              >
                <Stat
                  title="Squad"
                  value={data.timesheet.byKind.squad.uniqueClients.toString()}
                  color="#3B82F6"
                  total={data.timesheet.uniqueClients}
                />
              </div>
              <div
                className={`${getStatClassName('internal')} transform`}
                onClick={() => handleStatClick('internal')}
              >
                <Stat
                  title="Internal"
                  value={data.timesheet.byKind.internal.uniqueClients.toString()}
                  color="#10B981"
                  total={data.timesheet.uniqueClients}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientStatsSection;
