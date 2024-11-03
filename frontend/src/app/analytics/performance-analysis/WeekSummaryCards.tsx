import { PerformanceCard } from './PerformanceCard';
import { format } from 'date-fns';

interface Selection {
  weekStart?: string;
  accountManager?: string;
  clientName?: string;
}

interface WeekSummaryCardsProps {
  performanceData: any;
  selection: Selection;
  onSelection: (selection: Selection) => void;
}

export function WeekSummaryCards({ 
  performanceData, 
  selection, 
  onSelection 
}: WeekSummaryCardsProps) {
  const selectedWeek = performanceData.weeks.find(
    (week: any) => week.start === selection.weekStart
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceData.weeks.map((week: any) => (
            <PerformanceCard 
              key={week.start}
              title={`${format(new Date(week.start), 'MMM d')} - ${format(new Date(week.end), 'MMM d')}`}
              isSelected={selection.weekStart === week.start}
              onSelect={() => onSelection({ weekStart: week.start })}
              regularHours={{
                actual: week.totalRegularActualWorkHours,
                approved: week.totalRegularApprovedWorkHours
              }}
              preContractedHours={{
                actual: week.totalPreContractedActualWorkHours,
                approved: week.totalPreContractedApprovedWorkHours
              }}
            />
          ))}
        </div>
      </div>

      {selectedWeek && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Managers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWeek.accountManagers.map((manager: any) => (
              <PerformanceCard
                key={manager.name}
                title={manager.name}
                isSelected={selection.accountManager === manager.name}
                onSelect={() => onSelection({ 
                  ...selection, 
                  accountManager: manager.name,
                  clientName: undefined
                })}
                regularHours={{
                  actual: manager.totalRegularActualWorkHours,
                  approved: manager.totalRegularApprovedWorkHours
                }}
                preContractedHours={{
                  actual: manager.totalPreContractedActualWorkHours,
                  approved: manager.totalPreContractedApprovedWorkHours
                }}
              />
            ))}
          </div>
        </div>
      )}

      {selectedWeek && selection.accountManager && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWeek.clients
              .filter((client: any) => client.accountManager === selection.accountManager)
              .map((client: any) => (
                <PerformanceCard
                  key={client.name}
                  title={client.name}
                  isSelected={selection.clientName === client.name}
                  onSelect={() => onSelection({ ...selection, clientName: client.name })}
                  regularHours={{
                    actual: client.totalRegularActualWorkHours,
                    approved: client.totalRegularApprovedWorkHours
                  }}
                  preContractedHours={{
                    actual: client.totalPreContractedActualWorkHours,
                    approved: client.totalPreContractedApprovedWorkHours
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {selectedWeek && selection.clientName && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWeek.cases
              .filter((caseData: any) => caseData.client === selection.clientName)
              .map((caseData: any) => (
                <PerformanceCard
                  key={caseData.id}
                  title={caseData.title}
                  subtitle={`Sponsor: ${caseData.sponsor}`}
                  isSelected={false}
                  onSelect={() => {}}
                  regularHours={{
                    actual: caseData.isPreContracted ? 0 : caseData.actualWorkHours,
                    approved: caseData.isPreContracted ? 0 : caseData.approvedWorkHours
                  }}
                  preContractedHours={{
                    actual: caseData.isPreContracted ? caseData.actualWorkHours : 0,
                    approved: caseData.isPreContracted ? caseData.approvedWorkHours : 0
                  }}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 