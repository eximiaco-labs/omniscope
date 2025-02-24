import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { gql, useQuery } from "@apollo/client"
import { useEdgeClient } from "@/app/hooks/useApolloClient"
import { TableHeaderComponent } from "@/app/financial/revenue-forecast/components/TableHeader"
import { TableRowComponent } from "@/app/financial/revenue-forecast/components/TableRow"
import { TableCellComponent } from "@/app/financial/revenue-forecast/components/TableCell"
import SectionHeader from "@/components/SectionHeader"

const GET_TIMESHEET_SUMMARY = gql`
  fragment SummaryFields on TimesheetSummary {
    uniqueClients
    uniqueWorkers
    uniqueCases
    uniqueSponsors
    uniqueAccountManagers
    uniqueWorkingDays
    
    averageHoursPerEntry
    stdDevHoursPerEntry
    
    averageHoursPerDay
    stdDevHoursPerDay
    
    averageHoursPerWorker
    stdDevHoursPerWorker
    
    averageHoursPerClient
    stdDevHoursPerClient
    
    averageHoursPerCase
    stdDevHoursPerCase
    
    averageHoursPerSponsor
    stdDevHoursPerSponsor
    
    averageHoursPerAccountManager
    stdDevHoursPerAccountManager
    
    totalConsultingHours
    totalSquadHours
    totalHandsOnHours
    totalInternalHours
  }

  query GetTimesheetSummaries {
    thisMonth: timesheet(slug: "this-month") {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    
    previousMonth: timesheet(slug: "previous-month") {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    
    twoMonthsMonth: timesheet(slug: "two-months-ago") {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    
    threeMonthsMonth: timesheet(slug: "three-months-ago") {
      summary {
        ...SummaryFields
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`

interface TimesheetSummaryData {
  uniqueClients: number
  uniqueWorkers: number
  uniqueCases: number
  uniqueSponsors: number
  uniqueAccountManagers: number
  uniqueWorkingDays: number
  
  averageHoursPerEntry: number
  stdDevHoursPerEntry: number
  
  averageHoursPerDay: number
  stdDevHoursPerDay: number
  
  averageHoursPerWorker: number
  stdDevHoursPerWorker: number
  
  averageHoursPerClient: number
  stdDevHoursPerClient: number
  
  averageHoursPerCase: number
  stdDevHoursPerCase: number
  
  averageHoursPerSponsor: number
  stdDevHoursPerSponsor: number
  
  averageHoursPerAccountManager: number
  stdDevHoursPerAccountManager: number
  
  totalConsultingHours: number
  totalSquadHours: number
  totalHandsOnHours: number
  totalInternalHours: number
}

interface ClientData {
  name: string
  totalHours: number
}

interface TimesheetData {
  summary: TimesheetSummaryData
  byClient: {
    data: ClientData[]
  }
  filterableFields: Array<{
    field: string
    options: string[]
    selectedValues: string[]
  }>
}

interface TimesheetSummaryProps {
  thisMonth: { summary: TimesheetSummaryData }
  previousMonth: { summary: TimesheetSummaryData }
  twoMonthsMonth: { summary: TimesheetSummaryData }
  threeMonthsMonth: { summary: TimesheetSummaryData }
}

type SortColumn = 'total' | 'current' | 'previous' | 'twoMonths' | 'threeMonths';
type SortDirection = 'asc' | 'desc';

const formatNumber = (num: number) => num.toFixed(2)
const formatInteger = (num: number) => Math.round(num).toString()

const getMonthName = (monthsAgo: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const TableMonthHeaders = ({ showTotals = false }) => (
  <TableRow>
    <TableHead className="border-r border-gray-400">Metric</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(3)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(2)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(1)}</TableHead>
    <TableHead className="w-[120px] border-x border-gray-200 text-center">{getMonthName(0)}</TableHead>
    {showTotals && <TableHead className="w-[120px] border-l border-gray-200 font-bold text-center">Total</TableHead>}
  </TableRow>
)

const ClientTableHeaders = ({ showTotals = false, sortColumn, sortDirection, onSort }: { 
  showTotals?: boolean, 
  sortColumn?: SortColumn,
  sortDirection?: SortDirection,
  onSort?: (column: SortColumn) => void 
}) => {
  const renderSortableHeader = (column: SortColumn, label: string) => (
    <TableHead 
      className={`w-[120px] border-x border-gray-200 text-center cursor-pointer hover:bg-gray-50`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {sortColumn === column && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <TableRow>
      <TableHead className="w-[50px] text-center">#</TableHead>
      <TableHead className="border-r border-gray-400">Client</TableHead>
      {renderSortableHeader('threeMonths', getMonthName(3))}
      {renderSortableHeader('twoMonths', getMonthName(2))}
      {renderSortableHeader('previous', getMonthName(1))}
      {renderSortableHeader('current', getMonthName(0))}
      {showTotals && renderSortableHeader('total', 'Total')}
    </TableRow>
  );
}

const StatRow = ({ 
  index,
  label, 
  current, 
  previous, 
  twoMonths, 
  threeMonths,
  showTotal = false,
  formatter = formatNumber
}: { 
  index?: number
  label: string
  current: number
  previous: number
  twoMonths: number
  threeMonths: number
  showTotal?: boolean
  formatter?: (num: number) => string
}) => {
  const total = threeMonths + twoMonths + previous + current

  return (
    <TableRow className={typeof index === 'number' ? 'h-[57px] border-b border-gray-200' : undefined}>
      {typeof index === 'number' && (
        <TableCell className="text-center text-gray-500 text-[10px]">
          {index + 1}
        </TableCell>
      )}
      <TableCell className="font-medium border-r border-gray-400">{label}</TableCell>
      <TableCellComponent
        value={threeMonths}
        normalizedValue={threeMonths}
        normalized={false}
        previousValue={null}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={twoMonths}
        normalizedValue={twoMonths}
        normalized={false}
        previousValue={threeMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={previous}
        normalizedValue={previous}
        normalized={false}
        previousValue={twoMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      <TableCellComponent
        value={current}
        normalizedValue={current}
        normalized={false}
        previousValue={previous}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
      />
      {showTotal && (
        <TableCellComponent
          value={total}
          normalizedValue={total}
          normalized={false}
          previousValue={null}
          formatter={formatter}
          className="w-[120px] border-l border-gray-200 font-bold text-[12px]"
        />
      )}
    </TableRow>
  )
}

const TotalRow = ({ data }: { data: any }) => {
  const threeMonthsTotal = 
    data.threeMonthsMonth.summary.totalConsultingHours +
    data.threeMonthsMonth.summary.totalSquadHours +
    data.threeMonthsMonth.summary.totalHandsOnHours +
    data.threeMonthsMonth.summary.totalInternalHours

  const twoMonthsTotal = 
    data.twoMonthsMonth.summary.totalConsultingHours +
    data.twoMonthsMonth.summary.totalSquadHours +
    data.twoMonthsMonth.summary.totalHandsOnHours +
    data.twoMonthsMonth.summary.totalInternalHours

  const previousTotal = 
    data.previousMonth.summary.totalConsultingHours +
    data.previousMonth.summary.totalSquadHours +
    data.previousMonth.summary.totalHandsOnHours +
    data.previousMonth.summary.totalInternalHours

  const currentTotal = 
    data.thisMonth.summary.totalConsultingHours +
    data.thisMonth.summary.totalSquadHours +
    data.thisMonth.summary.totalHandsOnHours +
    data.thisMonth.summary.totalInternalHours

  const grandTotal = threeMonthsTotal + twoMonthsTotal + previousTotal + currentTotal

  return (
    <TableRow className="font-bold border-t-4 h-[57px]">
      <TableCell className="text-center text-gray-500 text-[10px]"></TableCell>
      <TableCell className="border-r border-gray-400">Total</TableCell>
      <TableCellComponent
        value={threeMonthsTotal}
        normalizedValue={threeMonthsTotal}
        normalized={false}
        previousValue={null}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={twoMonthsTotal}
        normalizedValue={twoMonthsTotal}
        normalized={false}
        previousValue={threeMonthsTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={previousTotal}
        normalizedValue={previousTotal}
        normalized={false}
        previousValue={twoMonthsTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={currentTotal}
        normalizedValue={currentTotal}
        normalized={false}
        previousValue={previousTotal}
        formatter={formatNumber}
        className="w-[120px] border-x border-gray-200 font-bold text-[12px]"
      />
      <TableCellComponent
        value={grandTotal}
        normalizedValue={grandTotal}
        normalized={false}
        previousValue={null}
        formatter={formatNumber}
        className="w-[120px] border-l border-gray-200 font-bold text-[12px]"
      />
    </TableRow>
  )
}

export function TimesheetSummary() {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >(initialQueryFilters || []);

  // Convert API filter values to Options format
  const convertToOptions = (filterableFields: Array<{ field: string, options: string[], selectedValues: string[] }>) => {
    return filterableFields.reduce((acc: Option[], field) => {
      const fieldOptions = field.selectedValues.map(value => ({
        value: `${field.field}:${value}`,
        label: value
      }));
      return [...acc, ...fieldOptions];
    }, []);
  };
  
  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues = data?.thisMonth?.filterableFields?.reduce((acc: any[], field: any) => {
      const fieldValues = newSelectedValues
        .filter(
          (v) =>
            typeof v.value === "string" &&
            v.value.startsWith(`${field.field}:`)
        )
        .map((v) => (v.value as string).split(":")[1]);

      if (fieldValues.length > 0) {
        acc.push({
          field: field.field,
          selectedValues: fieldValues,
        });
      }
      return acc;
    }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };
  
  if (!client) return <p>Loading client...</p>;
  
  const { loading, error, data } = useQuery(GET_TIMESHEET_SUMMARY, {
    client,
    ssr: true
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const totalsByMonth = {
    threeMonthsAgo: data.threeMonthsMonth.summary.totalConsultingHours + 
                    data.threeMonthsMonth.summary.totalSquadHours + 
                    data.threeMonthsMonth.summary.totalHandsOnHours + 
                    data.threeMonthsMonth.summary.totalInternalHours,
    twoMonthsAgo: data.twoMonthsMonth.summary.totalConsultingHours + 
                  data.twoMonthsMonth.summary.totalSquadHours + 
                  data.twoMonthsMonth.summary.totalHandsOnHours + 
                  data.twoMonthsMonth.summary.totalInternalHours,
    oneMonthAgo: data.previousMonth.summary.totalConsultingHours + 
                 data.previousMonth.summary.totalSquadHours + 
                 data.previousMonth.summary.totalHandsOnHours + 
                 data.previousMonth.summary.totalInternalHours,
    current: data.thisMonth.summary.totalConsultingHours + 
             data.thisMonth.summary.totalSquadHours + 
             data.thisMonth.summary.totalHandsOnHours + 
             data.thisMonth.summary.totalInternalHours,
  };

  const categories = [
    {
      name: "Consulting Hours",
      threeMonthsAgo: data.threeMonthsMonth.summary.totalConsultingHours,
      twoMonthsAgo: data.twoMonthsMonth.summary.totalConsultingHours,
      oneMonthAgo: data.previousMonth.summary.totalConsultingHours,
      current: data.thisMonth.summary.totalConsultingHours,
    },
    {
      name: "Squad Hours",
      threeMonthsAgo: data.threeMonthsMonth.summary.totalSquadHours,
      twoMonthsAgo: data.twoMonthsMonth.summary.totalSquadHours,
      oneMonthAgo: data.previousMonth.summary.totalSquadHours,
      current: data.thisMonth.summary.totalSquadHours,
    },
    {
      name: "Hands-on Hours",
      threeMonthsAgo: data.threeMonthsMonth.summary.totalHandsOnHours,
      twoMonthsAgo: data.twoMonthsMonth.summary.totalHandsOnHours,
      oneMonthAgo: data.previousMonth.summary.totalHandsOnHours,
      current: data.thisMonth.summary.totalHandsOnHours,
    },
    {
      name: "Internal Hours",
      threeMonthsAgo: data.threeMonthsMonth.summary.totalInternalHours,
      twoMonthsAgo: data.twoMonthsMonth.summary.totalInternalHours,
      oneMonthAgo: data.previousMonth.summary.totalInternalHours,
      current: data.thisMonth.summary.totalInternalHours,
    }
  ];

  const dates = {
    lastDayOfThreeMonthsAgo: getMonthName(3),
    lastDayOfTwoMonthsAgo: getMonthName(2),
    lastDayOfOneMonthAgo: getMonthName(1),
    inAnalysis: getMonthName(0),
  };

  const workingDays = {
    threeMonthsAgo: data.threeMonthsMonth.summary.uniqueWorkingDays,
    twoMonthsAgo: data.twoMonthsMonth.summary.uniqueWorkingDays,
    oneMonthAgo: data.previousMonth.summary.uniqueWorkingDays,
    inAnalysis: data.thisMonth.summary.uniqueWorkingDays,
  };

  return (
    <div className="space-y-8">
      {/* Total Hours Section */}
      <div>
        <SectionHeader 
          title="Total Hours by Category" 
          subtitle="Monthly distribution of hours by category"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <TableMonthHeaders showTotals={true} />
            </TableHeader>
            <TableBody>
              <StatRow 
                label="Consulting Hours"
                current={data.thisMonth.summary.totalConsultingHours}
                previous={data.previousMonth.summary.totalConsultingHours}
                twoMonths={data.twoMonthsMonth.summary.totalConsultingHours}
                threeMonths={data.threeMonthsMonth.summary.totalConsultingHours}
                showTotal={true}
              />
              <StatRow 
                label="Squad Hours"
                current={data.thisMonth.summary.totalSquadHours}
                previous={data.previousMonth.summary.totalSquadHours}
                twoMonths={data.twoMonthsMonth.summary.totalSquadHours}
                threeMonths={data.threeMonthsMonth.summary.totalSquadHours}
                showTotal={true}
              />
              <StatRow 
                label="Hands-on Hours"
                current={data.thisMonth.summary.totalHandsOnHours}
                previous={data.previousMonth.summary.totalHandsOnHours}
                twoMonths={data.twoMonthsMonth.summary.totalHandsOnHours}
                threeMonths={data.threeMonthsMonth.summary.totalHandsOnHours}
                showTotal={true}
              />
              <StatRow 
                label="Internal Hours"
                current={data.thisMonth.summary.totalInternalHours}
                previous={data.previousMonth.summary.totalInternalHours}
                twoMonths={data.twoMonthsMonth.summary.totalInternalHours}
                threeMonths={data.threeMonthsMonth.summary.totalInternalHours}
                showTotal={true}
              />
              <TotalRow data={data} />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <SectionHeader 
          title="Unique Entries Overview" 
          subtitle="Monthly count of unique entities"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <TableMonthHeaders />
            </TableHeader>
            <TableBody>
              <StatRow 
                label="Unique Clients"
                current={data.thisMonth.summary.uniqueClients}
                previous={data.previousMonth.summary.uniqueClients}
                twoMonths={data.twoMonthsMonth.summary.uniqueClients}
                threeMonths={data.threeMonthsMonth.summary.uniqueClients}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Workers"
                current={data.thisMonth.summary.uniqueWorkers}
                previous={data.previousMonth.summary.uniqueWorkers}
                twoMonths={data.twoMonthsMonth.summary.uniqueWorkers}
                threeMonths={data.threeMonthsMonth.summary.uniqueWorkers}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Cases"
                current={data.thisMonth.summary.uniqueCases}
                previous={data.previousMonth.summary.uniqueCases}
                twoMonths={data.twoMonthsMonth.summary.uniqueCases}
                threeMonths={data.threeMonthsMonth.summary.uniqueCases}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Sponsors"
                current={data.thisMonth.summary.uniqueSponsors}
                previous={data.previousMonth.summary.uniqueSponsors}
                twoMonths={data.twoMonthsMonth.summary.uniqueSponsors}
                threeMonths={data.threeMonthsMonth.summary.uniqueSponsors}
                formatter={formatInteger}
              />
              <StatRow 
                label="Unique Account Managers"
                current={data.thisMonth.summary.uniqueAccountManagers}
                previous={data.previousMonth.summary.uniqueAccountManagers}
                twoMonths={data.twoMonthsMonth.summary.uniqueAccountManagers}
                threeMonths={data.threeMonthsMonth.summary.uniqueAccountManagers}
                formatter={formatInteger}
              />
              <StatRow 
                label="Working Days"
                current={data.thisMonth.summary.uniqueWorkingDays}
                previous={data.previousMonth.summary.uniqueWorkingDays}
                twoMonths={data.twoMonthsMonth.summary.uniqueWorkingDays}
                threeMonths={data.threeMonthsMonth.summary.uniqueWorkingDays}
                formatter={formatInteger}
              />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Client Hours Distribution Section */}
      <div>
        <SectionHeader 
          title="Client Hours Distribution" 
          subtitle="Distribution of hours across different clients"
        />
        <div className="mx-2">
          <div className="h-[400px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: getMonthName(3),
                    clients: data.threeMonthsMonth.byClient.data.map((client: ClientData) => ({
                      name: client.name,
                      hours: client.totalHours
                    }))
                  },
                  {
                    name: getMonthName(2),
                    clients: data.twoMonthsMonth.byClient.data.map((client: ClientData) => ({
                      name: client.name,
                      hours: client.totalHours
                    }))
                  },
                  {
                    name: getMonthName(1),
                    clients: data.previousMonth.byClient.data.map((client: ClientData) => ({
                      name: client.name,
                      hours: client.totalHours
                    }))
                  },
                  {
                    name: getMonthName(0),
                    clients: data.thisMonth.byClient.data.map((client: ClientData) => ({
                      name: client.name,
                      hours: client.totalHours
                    }))
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const clientName = name.match(/clients\[(\d+)\]\.hours/)?.[1];
                    if (clientName !== undefined) {
                      const client = data.thisMonth.byClient.data[parseInt(clientName)];
                      return [`${client.name}: ${value.toFixed(2)}`, 'Hours'];
                    }
                    return [value.toFixed(2), 'Hours'];
                  }}
                />
                <Legend />
                {data.thisMonth.byClient.data.map((client: ClientData, index: number) => (
                  <Bar
                    key={client.name}
                    dataKey={`clients[${index}].hours`}
                    name={client.name}
                    fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table>
            <TableHeader>
              <ClientTableHeaders 
                showTotals={true} 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHeader>
            <TableBody>
              {getSortedClients(data.thisMonth.byClient.data).map((client: ClientData, index: number) => {
                const clientData = {
                  current: client.totalHours,
                  previous: data.previousMonth.byClient.data.find((c: ClientData) => c.name === client.name)?.totalHours || 0,
                  twoMonths: data.twoMonthsMonth.byClient.data.find((c: ClientData) => c.name === client.name)?.totalHours || 0,
                  threeMonths: data.threeMonthsMonth.byClient.data.find((c: ClientData) => c.name === client.name)?.totalHours || 0
                };
                
                return (
                  <StatRow
                    key={client.name}
                    index={index}
                    label={client.name}
                    current={clientData.current}
                    previous={clientData.previous}
                    twoMonths={clientData.twoMonths}
                    threeMonths={clientData.threeMonths}
                    showTotal={true}
                  />
                );
              })}
              <TotalRow data={data} />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Averages Section */}
      <div>
        <SectionHeader 
          title="Averages and Standard Deviations" 
          subtitle="Monthly statistics and variations"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <TableMonthHeaders />
            </TableHeader>
            <TableBody>
              <StatRow 
                label="Avg Hours/Entry"
                current={data.thisMonth.summary.averageHoursPerEntry}
                previous={data.previousMonth.summary.averageHoursPerEntry}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerEntry}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerEntry}
              />
              <StatRow 
                label="StdDev Hours/Entry"
                current={data.thisMonth.summary.stdDevHoursPerEntry}
                previous={data.previousMonth.summary.stdDevHoursPerEntry}
                twoMonths={data.twoMonthsMonth.summary.stdDevHoursPerEntry}
                threeMonths={data.threeMonthsMonth.summary.stdDevHoursPerEntry}
              />
              <StatRow 
                label="Avg Hours/Day"
                current={data.thisMonth.summary.averageHoursPerDay}
                previous={data.previousMonth.summary.averageHoursPerDay}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerDay}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerDay}
              />
              <StatRow 
                label="StdDev Hours/Day"
                current={data.thisMonth.summary.stdDevHoursPerDay}
                previous={data.previousMonth.summary.stdDevHoursPerDay}
                twoMonths={data.twoMonthsMonth.summary.stdDevHoursPerDay}
                threeMonths={data.threeMonthsMonth.summary.stdDevHoursPerDay}
              />
              <StatRow 
                label="Avg Hours/Worker"
                current={data.thisMonth.summary.averageHoursPerWorker}
                previous={data.previousMonth.summary.averageHoursPerWorker}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerWorker}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerWorker}
              />
              <StatRow 
                label="Avg Hours/Client"
                current={data.thisMonth.summary.averageHoursPerClient}
                previous={data.previousMonth.summary.averageHoursPerClient}
                twoMonths={data.twoMonthsMonth.summary.averageHoursPerClient}
                threeMonths={data.threeMonthsMonth.summary.averageHoursPerClient}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
