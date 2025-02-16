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
    }
    
    previousMonth: timesheet(slug: "previous-month") {
      summary {
        ...SummaryFields
      }
    }
    
    twoMonthsMonth: timesheet(slug: "two-months-ago") {
      summary {
        ...SummaryFields
      }
    }
    
    threeMonthsMonth: timesheet(slug: "three-months-ago") {
      summary {
        ...SummaryFields
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

interface TimesheetSummaryProps {
  thisMonth: { summary: TimesheetSummaryData }
  previousMonth: { summary: TimesheetSummaryData }
  twoMonthsMonth: { summary: TimesheetSummaryData }
  threeMonthsMonth: { summary: TimesheetSummaryData }
}

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

const StatRow = ({ 
  label, 
  current, 
  previous, 
  twoMonths, 
  threeMonths,
  showTotal = false,
  formatter = formatNumber
}: { 
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
    <TableRow>
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
    <TableRow className="font-bold border-t-2">
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
