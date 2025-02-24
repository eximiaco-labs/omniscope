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
import { FilterFieldsSelect } from "@/app/components/FilterFieldsSelect"
import { useState, useEffect } from "react"
import { Option } from "react-tailwindcss-select/dist/components/type"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

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

  query GetTimesheetSummary($filters: [DatasetFilterInput]) {
    thisMonth: timesheet(slug: "this-month", filters: $filters) {
      summary {
        ...SummaryFields
      }
      byClient {
        data {
          name
          totalHours
        }
      }
      byWorker {
        data {
          name
          totalHours
        }
      }
      byCase {
        data {
          title
          totalHours
        }
      }
      bySponsor {
        data {
          name
          totalHours
        }
      }
      byAccountManager {
        data {
          name
          totalHours
        }
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    previousMonth: timesheet(slug: "previous-month", filters: $filters) {
      summary {
        ...SummaryFields
      }
      byClient {
        data {
          name
          totalHours
        }
      }
      byWorker {
        data {
          name
          totalHours
        }
      }
      byCase {
        data {
          title
          totalHours
        }
      }
      bySponsor {
        data {
          name
          totalHours
        }
      }
      byAccountManager {
        data {
          name
          totalHours
        }
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    twoMonthsMonth: timesheet(slug: "two-months-ago", filters: $filters) {
      summary {
        ...SummaryFields
      }
      byClient {
        data {
          name
          totalHours
        }
      }
      byWorker {
        data {
          name
          totalHours
        }
      }
      byCase {
        data {
          title
          totalHours
        }
      }
      bySponsor {
        data {
          name
          totalHours
        }
      }
      byAccountManager {
        data {
          name
          totalHours
        }
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
    threeMonthsMonth: timesheet(slug: "three-months-ago", filters: $filters) {
      summary {
        ...SummaryFields
      }
      byClient {
        data {
          name
          totalHours
        }
      }
      byWorker {
        data {
          name
          totalHours
        }
      }
      byCase {
        data {
          title
          totalHours
        }
      }
      bySponsor {
        data {
          name
          totalHours
        }
      }
      byAccountManager {
        data {
          name
          totalHours
        }
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

interface WorkerData {
  name: string
  totalHours: number
}

interface CaseData {
  title: string
  totalHours: number
}

interface SponsorData {
  name: string
  totalHours: number
}

interface AccountManagerData {
  name: string
  totalHours: number
}

interface TimesheetData {
  summary: TimesheetSummaryData
  byClient: {
    data: ClientData[]
  }
  byWorker: {
    data: WorkerData[]
  }
  byCase: {
    data: CaseData[]
  }
  bySponsor: {
    data: SponsorData[]
  }
  byAccountManager: {
    data: AccountManagerData[]
  }
  filterableFields: Array<{
    field: string
    options: string[]
    selectedValues: string[]
  }>
}

interface TimesheetSummaryProps {
  initialQueryFilters?: Array<{ field: string; selectedValues: string[] }>
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

const EntityTableHeaders = ({ showTotals = false, sortColumn, sortDirection, onSort, entityType = 'Client' }: { 
  showTotals?: boolean, 
  sortColumn?: SortColumn,
  sortDirection?: SortDirection,
  onSort?: (column: SortColumn) => void,
  entityType?: 'Client' | 'Worker' | 'Case' | 'Sponsor' | 'Account Manager'
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
      <TableHead className="border-r border-gray-400">{entityType}</TableHead>
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
  formatter = formatNumber,
  columnTotals
}: { 
  index?: number
  label: string
  current: number
  previous: number
  twoMonths: number
  threeMonths: number
  showTotal?: boolean
  formatter?: (num: number) => string
  columnTotals?: {
    current: number
    previous: number
    twoMonths: number
    threeMonths: number
    total: number
  }
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
        totalValue={columnTotals?.threeMonths}
      />
      <TableCellComponent
        value={twoMonths}
        normalizedValue={twoMonths}
        normalized={false}
        previousValue={threeMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
        totalValue={columnTotals?.twoMonths}
      />
      <TableCellComponent
        value={previous}
        normalizedValue={previous}
        normalized={false}
        previousValue={twoMonths}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
        totalValue={columnTotals?.previous}
      />
      <TableCellComponent
        value={current}
        normalizedValue={current}
        normalized={false}
        previousValue={previous}
        formatter={formatter}
        className="w-[120px] border-x border-gray-200 text-[12px]"
        totalValue={columnTotals?.current}
      />
      {showTotal && (
        <TableCellComponent
          value={total}
          normalizedValue={total}
          normalized={false}
          previousValue={null}
          formatter={formatter}
          className="w-[120px] border-l border-gray-200 font-bold text-[12px]"
          totalValue={columnTotals?.total}
        />
      )}
    </TableRow>
  )
}

const TotalRow = ({ data, type = 'general' }: { 
  data: any, 
  type?: 'general' | 'byKind' | 'byClient' | 'byWorker' | 'byCase' | 'bySponsor' | 'byAccountManager' 
}) => {
  let threeMonthsTotal = 0;
  let twoMonthsTotal = 0;
  let previousTotal = 0;
  let currentTotal = 0;

  if (type === 'byKind') {
    threeMonthsTotal = data.threeMonthsMonth.summary.totalConsultingHours +
      data.threeMonthsMonth.summary.totalSquadHours +
      data.threeMonthsMonth.summary.totalHandsOnHours +
      data.threeMonthsMonth.summary.totalInternalHours;

    twoMonthsTotal = data.twoMonthsMonth.summary.totalConsultingHours +
      data.twoMonthsMonth.summary.totalSquadHours +
      data.twoMonthsMonth.summary.totalHandsOnHours +
      data.twoMonthsMonth.summary.totalInternalHours;

    previousTotal = data.previousMonth.summary.totalConsultingHours +
      data.previousMonth.summary.totalSquadHours +
      data.previousMonth.summary.totalHandsOnHours +
      data.previousMonth.summary.totalInternalHours;

    currentTotal = data.thisMonth.summary.totalConsultingHours +
      data.thisMonth.summary.totalSquadHours +
      data.thisMonth.summary.totalHandsOnHours +
      data.thisMonth.summary.totalInternalHours;
  } else if (type === 'byClient') {
    threeMonthsTotal = data.threeMonthsMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0);
    twoMonthsTotal = data.twoMonthsMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0);
    previousTotal = data.previousMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0);
    currentTotal = data.thisMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0);
  } else if (type === 'byWorker') {
    threeMonthsTotal = data.threeMonthsMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0);
    twoMonthsTotal = data.twoMonthsMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0);
    previousTotal = data.previousMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0);
    currentTotal = data.thisMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0);
  } else if (type === 'byCase') {
    threeMonthsTotal = data.threeMonthsMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0);
    twoMonthsTotal = data.twoMonthsMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0);
    previousTotal = data.previousMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0);
    currentTotal = data.thisMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0);
  } else if (type === 'bySponsor') {
    threeMonthsTotal = data.threeMonthsMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0);
    twoMonthsTotal = data.twoMonthsMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0);
    previousTotal = data.previousMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0);
    currentTotal = data.thisMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0);
  } else if (type === 'byAccountManager') {
    threeMonthsTotal = data.threeMonthsMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0);
    twoMonthsTotal = data.twoMonthsMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0);
    previousTotal = data.previousMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0);
    currentTotal = data.thisMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0);
  } else {
    threeMonthsTotal = data.threeMonthsMonth.summary.totalConsultingHours +
      data.threeMonthsMonth.summary.totalSquadHours +
      data.threeMonthsMonth.summary.totalHandsOnHours +
      data.threeMonthsMonth.summary.totalInternalHours;

    twoMonthsTotal = data.twoMonthsMonth.summary.totalConsultingHours +
      data.twoMonthsMonth.summary.totalSquadHours +
      data.twoMonthsMonth.summary.totalHandsOnHours +
      data.twoMonthsMonth.summary.totalInternalHours;

    previousTotal = data.previousMonth.summary.totalConsultingHours +
      data.previousMonth.summary.totalSquadHours +
      data.previousMonth.summary.totalHandsOnHours +
      data.previousMonth.summary.totalInternalHours;

    currentTotal = data.thisMonth.summary.totalConsultingHours +
      data.thisMonth.summary.totalSquadHours +
      data.thisMonth.summary.totalHandsOnHours +
      data.thisMonth.summary.totalInternalHours;
  }

  const grandTotal = threeMonthsTotal + twoMonthsTotal + previousTotal + currentTotal;
  const showSequenceColumn = type === 'byClient' || type === 'byWorker' || type === 'byCase' || type === 'bySponsor' || type === 'byAccountManager';

  return (
    <TableRow className="font-bold border-t-4 h-[57px]">
      {showSequenceColumn && (
        <TableCell className="text-center text-gray-500 text-[10px]"></TableCell>
      )}
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

export function TimesheetSummary({ initialQueryFilters }: TimesheetSummaryProps) {
  const client = useEdgeClient();
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [workerSortColumn, setWorkerSortColumn] = useState<SortColumn>('total');
  const [workerSortDirection, setWorkerSortDirection] = useState<SortDirection>('desc');
  const [caseSortColumn, setCaseSortColumn] = useState<SortColumn>('total');
  const [caseSortDirection, setCaseSortDirection] = useState<SortDirection>('desc');
  const [sponsorSortColumn, setSponsorSortColumn] = useState<SortColumn>('total');
  const [sponsorSortDirection, setSponsorSortDirection] = useState<SortDirection>('desc');
  const [accountManagerSortColumn, setAccountManagerSortColumn] = useState<SortColumn>('total');
  const [accountManagerSortDirection, setAccountManagerSortDirection] = useState<SortDirection>('desc');
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
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleWorkerSort = (column: SortColumn) => {
    if (workerSortColumn === column) {
      setWorkerSortDirection(workerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setWorkerSortColumn(column);
      setWorkerSortDirection('desc');
    }
  };

  const handleCaseSort = (column: SortColumn) => {
    if (caseSortColumn === column) {
      setCaseSortDirection(caseSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCaseSortColumn(column);
      setCaseSortDirection('desc');
    }
  };

  const handleSponsorSort = (column: SortColumn) => {
    if (sponsorSortColumn === column) {
      setSponsorSortDirection(sponsorSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSponsorSortColumn(column);
      setSponsorSortDirection('desc');
    }
  };

  const handleAccountManagerSort = (column: SortColumn) => {
    if (accountManagerSortColumn === column) {
      setAccountManagerSortDirection(accountManagerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAccountManagerSortColumn(column);
      setAccountManagerSortDirection('desc');
    }
  };

  const getSortedClients = (clients: ClientData[]) => {
    return [...clients].sort((a, b) => {
      const aData = {
        current: a.totalHours,
        previous: data.previousMonth.byClient.data.find((c: ClientData) => c.name === a.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byClient.data.find((c: ClientData) => c.name === a.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byClient.data.find((c: ClientData) => c.name === a.name)?.totalHours || 0
      };
      const bData = {
        current: b.totalHours,
        previous: data.previousMonth.byClient.data.find((c: ClientData) => c.name === b.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byClient.data.find((c: ClientData) => c.name === b.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byClient.data.find((c: ClientData) => c.name === b.name)?.totalHours || 0
      };

      let aValue = sortColumn === 'total' 
        ? aData.current + aData.previous + aData.twoMonths + aData.threeMonths
        : aData[sortColumn];
      let bValue = sortColumn === 'total'
        ? bData.current + bData.previous + bData.twoMonths + bData.threeMonths
        : bData[sortColumn];

      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  };

  const getSortedWorkers = (workers: WorkerData[]) => {
    return [...workers].sort((a, b) => {
      const aData = {
        current: a.totalHours,
        previous: data.previousMonth.byWorker.data.find((w: WorkerData) => w.name === a.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === a.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === a.name)?.totalHours || 0
      };
      const bData = {
        current: b.totalHours,
        previous: data.previousMonth.byWorker.data.find((w: WorkerData) => w.name === b.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === b.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === b.name)?.totalHours || 0
      };

      let aValue = workerSortColumn === 'total' 
        ? aData.current + aData.previous + aData.twoMonths + aData.threeMonths
        : aData[workerSortColumn];
      let bValue = workerSortColumn === 'total'
        ? bData.current + bData.previous + bData.twoMonths + bData.threeMonths
        : bData[workerSortColumn];

      return workerSortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  };

  const getSortedCases = (cases: CaseData[]) => {
    return [...cases].sort((a, b) => {
      const aData = {
        current: a.totalHours,
        previous: data.previousMonth.byCase.data.find((c: CaseData) => c.title === a.title)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byCase.data.find((c: CaseData) => c.title === a.title)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byCase.data.find((c: CaseData) => c.title === a.title)?.totalHours || 0
      };
      const bData = {
        current: b.totalHours,
        previous: data.previousMonth.byCase.data.find((c: CaseData) => c.title === b.title)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byCase.data.find((c: CaseData) => c.title === b.title)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byCase.data.find((c: CaseData) => c.title === b.title)?.totalHours || 0
      };

      let aValue = caseSortColumn === 'total' 
        ? aData.current + aData.previous + aData.twoMonths + aData.threeMonths
        : aData[caseSortColumn];
      let bValue = caseSortColumn === 'total'
        ? bData.current + bData.previous + bData.twoMonths + bData.threeMonths
        : bData[caseSortColumn];

      return caseSortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  };

  const getSortedSponsors = (sponsors: SponsorData[]) => {
    return [...sponsors].sort((a, b) => {
      const aData = {
        current: a.totalHours,
        previous: data.previousMonth.bySponsor.data.find((s: SponsorData) => s.name === a.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === a.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === a.name)?.totalHours || 0
      };
      const bData = {
        current: b.totalHours,
        previous: data.previousMonth.bySponsor.data.find((s: SponsorData) => s.name === b.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === b.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === b.name)?.totalHours || 0
      };

      let aValue = sponsorSortColumn === 'total' 
        ? aData.current + aData.previous + aData.twoMonths + aData.threeMonths
        : aData[sponsorSortColumn];
      let bValue = sponsorSortColumn === 'total'
        ? bData.current + bData.previous + bData.twoMonths + bData.threeMonths
        : bData[sponsorSortColumn];

      return sponsorSortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  };

  const getSortedAccountManagers = (accountManagers: AccountManagerData[]) => {
    return [...accountManagers].sort((a, b) => {
      const aData = {
        current: a.totalHours,
        previous: data.previousMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === a.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === a.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === a.name)?.totalHours || 0
      };
      const bData = {
        current: b.totalHours,
        previous: data.previousMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === b.name)?.totalHours || 0,
        twoMonths: data.twoMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === b.name)?.totalHours || 0,
        threeMonths: data.threeMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === b.name)?.totalHours || 0
      };

      let aValue = accountManagerSortColumn === 'total' 
        ? aData.current + aData.previous + aData.twoMonths + aData.threeMonths
        : aData[accountManagerSortColumn];
      let bValue = accountManagerSortColumn === 'total'
        ? bData.current + bData.previous + bData.twoMonths + bData.threeMonths
        : bData[accountManagerSortColumn];

      return accountManagerSortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  };

  if (!client) return <p>Loading client...</p>;
  
  const { loading, error, data } = useQuery(GET_TIMESHEET_SUMMARY, {
    client,
    variables: {
      filters: formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    ssr: true
  });

  useEffect(() => {
    if (data?.thisMonth?.filterableFields) {
      const options = convertToOptions(data.thisMonth.filterableFields);
      setSelectedFilters(options);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const chartData = [
    {
      name: getMonthName(3),
      consulting: data.threeMonthsMonth.summary.totalConsultingHours,
      squad: data.threeMonthsMonth.summary.totalSquadHours,
      handsOn: data.threeMonthsMonth.summary.totalHandsOnHours,
      internal: data.threeMonthsMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(2),
      consulting: data.twoMonthsMonth.summary.totalConsultingHours,
      squad: data.twoMonthsMonth.summary.totalSquadHours,
      handsOn: data.twoMonthsMonth.summary.totalHandsOnHours,
      internal: data.twoMonthsMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(1),
      consulting: data.previousMonth.summary.totalConsultingHours,
      squad: data.previousMonth.summary.totalSquadHours,
      handsOn: data.previousMonth.summary.totalHandsOnHours,
      internal: data.previousMonth.summary.totalInternalHours,
    },
    {
      name: getMonthName(0),
      consulting: data.thisMonth.summary.totalConsultingHours,
      squad: data.thisMonth.summary.totalSquadHours,
      handsOn: data.thisMonth.summary.totalHandsOnHours,
      internal: data.thisMonth.summary.totalInternalHours,
    },
  ];

  // Check which kinds have non-zero values
  const activeKinds = {
    consulting: chartData.some(d => d.consulting > 0),
    squad: chartData.some(d => d.squad > 0),
    handsOn: chartData.some(d => d.handsOn > 0),
    internal: chartData.some(d => d.internal > 0),
  };

  const barConfig = [
    { dataKey: "consulting", name: "Consulting", fill: "#F59E0B" },
    { dataKey: "squad", name: "Squad", fill: "#3B82F6" },
    { dataKey: "handsOn", name: "Hands-On", fill: "#8B5CF6" },
    { dataKey: "internal", name: "Internal", fill: "#10B981" },
  ].filter(config => activeKinds[config.dataKey as keyof typeof activeKinds]);

  return (
    <div className="space-y-8">
      <div className="relative z-[40]">
        <FilterFieldsSelect
          data={data?.thisMonth}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>

      {/* Total Hours Section */}
      <div>
        <SectionHeader 
          title="Total Hours by Kind" 
          subtitle="Distribution of hours across different work kinds"
        />
        <div className="mx-2">
          <div className="h-[400px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2), 'Hours']}
                />
                <Legend />
                {barConfig.map(config => (
                  <Bar 
                    key={config.dataKey}
                    dataKey={config.dataKey}
                    name={config.name}
                    fill={config.fill}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table>
            <TableHeader>
              <TableMonthHeaders showTotals={true} />
            </TableHeader>
            <TableBody>
              {(() => {
                const rows = [
                  {
                    label: "Consulting Hours",
                    current: data.thisMonth.summary.totalConsultingHours,
                    previous: data.previousMonth.summary.totalConsultingHours,
                    twoMonths: data.twoMonthsMonth.summary.totalConsultingHours,
                    threeMonths: data.threeMonthsMonth.summary.totalConsultingHours,
                  },
                  {
                    label: "Squad Hours",
                    current: data.thisMonth.summary.totalSquadHours,
                    previous: data.previousMonth.summary.totalSquadHours,
                    twoMonths: data.twoMonthsMonth.summary.totalSquadHours,
                    threeMonths: data.threeMonthsMonth.summary.totalSquadHours,
                  },
                  {
                    label: "Hands-on Hours",
                    current: data.thisMonth.summary.totalHandsOnHours,
                    previous: data.previousMonth.summary.totalHandsOnHours,
                    twoMonths: data.twoMonthsMonth.summary.totalHandsOnHours,
                    threeMonths: data.threeMonthsMonth.summary.totalHandsOnHours,
                  },
                  {
                    label: "Internal Hours",
                    current: data.thisMonth.summary.totalInternalHours,
                    previous: data.previousMonth.summary.totalInternalHours,
                    twoMonths: data.twoMonthsMonth.summary.totalInternalHours,
                    threeMonths: data.threeMonthsMonth.summary.totalInternalHours,
                  }
                ].filter(row => 
                  row.current + row.previous + row.twoMonths + row.threeMonths > 0
                );

                return (
                  <>
                    {rows.map(row => (
                      <StatRow 
                        key={row.label}
                        label={row.label}
                        current={row.current}
                        previous={row.previous}
                        twoMonths={row.twoMonths}
                        threeMonths={row.threeMonths}
                        showTotal={true}
                      />
                    ))}
                    {rows.length > 1 && <TotalRow data={data} type="byKind" />}
                  </>
                );
              })()}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <SectionHeader 
          title="Unique Entries Overview" 
          subtitle="Analysis of unique entities across different dimensions"
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
          <Table>
            <TableHeader>
              <EntityTableHeaders 
                showTotals={true} 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                entityType="Client"
              />
            </TableHeader>
            <TableBody>
              {(() => {
                const columnTotals = {
                  current: data.thisMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0),
                  previous: data.previousMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0),
                  twoMonths: data.twoMonthsMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0),
                  threeMonths: data.threeMonthsMonth.byClient.data.reduce((sum: number, c: ClientData) => sum + c.totalHours, 0),
                  get total() {
                    return this.current + this.previous + this.twoMonths + this.threeMonths;
                  }
                };

                return getSortedClients(data.thisMonth.byClient.data).map((client: ClientData, index: number) => {
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
                      columnTotals={columnTotals}
                    />
                  );
                });
              })()}
              <TotalRow data={data} type="byClient" />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Worker Hours Distribution Section */}
      <div>
        <SectionHeader 
          title="Worker Hours Distribution" 
          subtitle="Distribution of hours across different workers"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <EntityTableHeaders 
                showTotals={true} 
                sortColumn={workerSortColumn}
                sortDirection={workerSortDirection}
                onSort={handleWorkerSort}
                entityType="Worker"
              />
            </TableHeader>
            <TableBody>
              {(() => {
                const columnTotals = {
                  current: data.thisMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0),
                  previous: data.previousMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0),
                  twoMonths: data.twoMonthsMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0),
                  threeMonths: data.threeMonthsMonth.byWorker.data.reduce((sum: number, w: WorkerData) => sum + w.totalHours, 0),
                  get total() {
                    return this.current + this.previous + this.twoMonths + this.threeMonths;
                  }
                };

                return getSortedWorkers(data.thisMonth.byWorker.data).map((worker: WorkerData, index: number) => {
                  const workerData = {
                    current: worker.totalHours,
                    previous: data.previousMonth.byWorker.data.find((w: WorkerData) => w.name === worker.name)?.totalHours || 0,
                    twoMonths: data.twoMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === worker.name)?.totalHours || 0,
                    threeMonths: data.threeMonthsMonth.byWorker.data.find((w: WorkerData) => w.name === worker.name)?.totalHours || 0
                  };
                  
                  return (
                    <StatRow
                      key={worker.name}
                      index={index}
                      label={worker.name}
                      current={workerData.current}
                      previous={workerData.previous}
                      twoMonths={workerData.twoMonths}
                      threeMonths={workerData.threeMonths}
                      showTotal={true}
                      columnTotals={columnTotals}
                    />
                  );
                });
              })()}
              <TotalRow data={data} type="byWorker" />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Case Hours Distribution Section */}
      <div>
        <SectionHeader 
          title="Case Hours Distribution" 
          subtitle="Distribution of hours across different cases"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <EntityTableHeaders 
                showTotals={true} 
                sortColumn={caseSortColumn}
                sortDirection={caseSortDirection}
                onSort={handleCaseSort}
                entityType="Case"
              />
            </TableHeader>
            <TableBody>
              {(() => {
                const columnTotals = {
                  current: data.thisMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0),
                  previous: data.previousMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0),
                  twoMonths: data.twoMonthsMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0),
                  threeMonths: data.threeMonthsMonth.byCase.data.reduce((sum: number, c: CaseData) => sum + c.totalHours, 0),
                  get total() {
                    return this.current + this.previous + this.twoMonths + this.threeMonths;
                  }
                };

                return getSortedCases(data.thisMonth.byCase.data).map((caseItem: CaseData, index: number) => {
                  const caseData = {
                    current: caseItem.totalHours,
                    previous: data.previousMonth.byCase.data.find((c: CaseData) => c.title === caseItem.title)?.totalHours || 0,
                    twoMonths: data.twoMonthsMonth.byCase.data.find((c: CaseData) => c.title === caseItem.title)?.totalHours || 0,
                    threeMonths: data.threeMonthsMonth.byCase.data.find((c: CaseData) => c.title === caseItem.title)?.totalHours || 0
                  };
                  
                  return (
                    <StatRow
                      key={caseItem.title}
                      index={index}
                      label={caseItem.title}
                      current={caseData.current}
                      previous={caseData.previous}
                      twoMonths={caseData.twoMonths}
                      threeMonths={caseData.threeMonths}
                      showTotal={true}
                      columnTotals={columnTotals}
                    />
                  );
                });
              })()}
              <TotalRow data={data} type="byCase" />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sponsor Hours Distribution Section */}
      <div>
        <SectionHeader 
          title="Sponsor Hours Distribution" 
          subtitle="Distribution of hours across different sponsors"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <EntityTableHeaders 
                showTotals={true} 
                sortColumn={sponsorSortColumn}
                sortDirection={sponsorSortDirection}
                onSort={handleSponsorSort}
                entityType="Sponsor"
              />
            </TableHeader>
            <TableBody>
              {(() => {
                const columnTotals = {
                  current: data.thisMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0),
                  previous: data.previousMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0),
                  twoMonths: data.twoMonthsMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0),
                  threeMonths: data.threeMonthsMonth.bySponsor.data.reduce((sum: number, s: SponsorData) => sum + s.totalHours, 0),
                  get total() {
                    return this.current + this.previous + this.twoMonths + this.threeMonths;
                  }
                };

                return getSortedSponsors(data.thisMonth.bySponsor.data).map((sponsor: SponsorData, index: number) => {
                  const sponsorData = {
                    current: sponsor.totalHours,
                    previous: data.previousMonth.bySponsor.data.find((s: SponsorData) => s.name === sponsor.name)?.totalHours || 0,
                    twoMonths: data.twoMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === sponsor.name)?.totalHours || 0,
                    threeMonths: data.threeMonthsMonth.bySponsor.data.find((s: SponsorData) => s.name === sponsor.name)?.totalHours || 0
                  };
                  
                  return (
                    <StatRow
                      key={sponsor.name}
                      index={index}
                      label={sponsor.name}
                      current={sponsorData.current}
                      previous={sponsorData.previous}
                      twoMonths={sponsorData.twoMonths}
                      threeMonths={sponsorData.threeMonths}
                      showTotal={true}
                      columnTotals={columnTotals}
                    />
                  );
                });
              })()}
              <TotalRow data={data} type="bySponsor" />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Account Manager Hours Distribution Section */}
      <div>
        <SectionHeader 
          title="Account Manager Hours Distribution" 
          subtitle="Distribution of hours across different account managers"
        />
        <div className="mx-2">
          <Table>
            <TableHeader>
              <EntityTableHeaders 
                showTotals={true} 
                sortColumn={accountManagerSortColumn}
                sortDirection={accountManagerSortDirection}
                onSort={handleAccountManagerSort}
                entityType="Account Manager"
              />
            </TableHeader>
            <TableBody>
              {(() => {
                const columnTotals = {
                  current: data.thisMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0),
                  previous: data.previousMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0),
                  twoMonths: data.twoMonthsMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0),
                  threeMonths: data.threeMonthsMonth.byAccountManager.data.reduce((sum: number, am: AccountManagerData) => sum + am.totalHours, 0),
                  get total() {
                    return this.current + this.previous + this.twoMonths + this.threeMonths;
                  }
                };

                return getSortedAccountManagers(data.thisMonth.byAccountManager.data).map((accountManager: AccountManagerData, index: number) => {
                  const accountManagerData = {
                    current: accountManager.totalHours,
                    previous: data.previousMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === accountManager.name)?.totalHours || 0,
                    twoMonths: data.twoMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === accountManager.name)?.totalHours || 0,
                    threeMonths: data.threeMonthsMonth.byAccountManager.data.find((am: AccountManagerData) => am.name === accountManager.name)?.totalHours || 0
                  };
                  
                  return (
                    <StatRow
                      key={accountManager.name}
                      index={index}
                      label={accountManager.name}
                      current={accountManagerData.current}
                      previous={accountManagerData.previous}
                      twoMonths={accountManagerData.twoMonths}
                      threeMonths={accountManagerData.threeMonths}
                      showTotal={true}
                      columnTotals={columnTotals}
                    />
                  );
                });
              })()}
              <TotalRow data={data} type="byAccountManager" />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Averages Section */}
      <div>
        <SectionHeader 
          title="Averages and Standard Deviations" 
          subtitle="Statistical analysis of time distribution"
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
