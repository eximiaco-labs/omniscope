"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ACCOUNT_MANAGER, AccountManager } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { TimesheetSummary } from "./TimesheetSummary";
import { CasesSummary } from "./CasesSummary";
import { ActiveDealsSummary } from "./ActiveDealsSummary";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";
import SectionHeader from "@/components/SectionHeader";

import { getFlag } from "@/app/flags";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatType } from "@/app/constants/colors";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { RevenueProgression } from "@/app/financial/revenue-forecast/RevenueProgression";
import { useSession } from "next-auth/react";

interface Summary {
  hours: number;
  appointments: any[];
}

interface ClientSummary extends Summary {
  client: string;
  clientSlug: string;
}

interface SponsorSummary extends Summary {
  sponsor: string;
  sponsorSlug: string;
}

interface WorkerSummary extends Summary {
  workerName: string;
  workerSlug: string;
}

type SummaryType = ClientSummary | SponsorSummary | WorkerSummary;

const SummarySection = ({
  summaries,
  selectedStatType,
  type
}: {
  summaries: SummaryType[] | null;
  selectedStatType: StatType;
  type: "client" | "sponsor" | "worker";
}) => {
  if (!summaries) return null;

  const getNameAndSlug = (summary: SummaryType) => {
    switch(type) {
      case "client":
        return {
          name: (summary as ClientSummary).client,
          slug: (summary as ClientSummary).clientSlug,
          path: `/about-us/clients/${(summary as ClientSummary).clientSlug}`
        };
      case "sponsor":
        return {
          name: (summary as SponsorSummary).sponsor,
          slug: (summary as SponsorSummary).sponsorSlug,
          path: `/about-us/sponsors/${(summary as SponsorSummary).sponsorSlug}`
        };
      case "worker":
        return {
          name: (summary as WorkerSummary).workerName,
          slug: (summary as WorkerSummary).workerSlug,
          path: `/about-us/consultants-and-engineers/${(summary as WorkerSummary).workerSlug}`
        };
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Summary:</h3>
      {summaries.map((summary) => {
        const { name, path } = getNameAndSlug(summary);
        return (
          <div key={name} className="flex justify-between items-center py-1">
            <Link href={path} className="text-blue-600 hover:underline">
              {name}
            </Link>
            <div className="flex items-center gap-4">
              <span>{summary.hours.toFixed(1)}h</span>
              <Sheet>
                <SheetTrigger className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Details
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      {name} - {selectedStatType.charAt(0).toUpperCase() + selectedStatType.slice(1)} Hours
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Worker</TableHead>
                          <TableHead className="text-xs">Hours</TableHead>
                          <TableHead className="text-xs">Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.appointments.map((apt, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-xs">
                              {apt.date}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Link href={`/about-us/consultants-and-engineers/${apt.workerSlug}`} className="text-blue-600 hover:underline">
                                {apt.workerName}
                              </Link>
                            </TableCell>
                            <TableCell className="text-xs">
                              {apt.timeInHs}h
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">
                              {apt.comment}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function AccountManagerPage() {
  const params = useParams();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [selectedDataset, setSelectedDataset] = useState(
    "timesheet-last-six-weeks"
  );

  // Previous month states
  const [selectedDatePrev, setSelectedDatePrev] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
  const [selectedDayPrev, setSelectedDayPrev] = useState<number | null>(null);
  const [selectedRowPrev, setSelectedRowPrev] = useState<number | null>(null);
  const [selectedColumnPrev, setSelectedColumnPrev] = useState<number | null>(
    null
  );
  const [isAllSelectedPrev, setIsAllSelectedPrev] = useState(false);
  const [selectedStatTypePrev, setSelectedStatTypePrev] =
    useState<StatType>("consulting");

  // Current month states
  const [selectedDateCurr, setSelectedDateCurr] = useState(new Date());
  const [selectedDayCurr, setSelectedDayCurr] = useState<number | null>(null);
  const [selectedRowCurr, setSelectedRowCurr] = useState<number | null>(null);
  const [selectedColumnCurr, setSelectedColumnCurr] = useState<number | null>(
    null
  );
  const [isAllSelectedCurr, setIsAllSelectedCurr] = useState(false);
  const [selectedStatTypeCurr, setSelectedStatTypeCurr] =
    useState<StatType>("consulting");

  const getVisibleDates = (date: Date) => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const firstVisibleDate = new Date(
      currentYear,
      currentMonth,
      -startingDayOfWeek + 1
    );

    const daysInMonth = lastDayOfMonth.getDate();
    const totalDays = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    const remainingDays = weeksNeeded * 7 - (startingDayOfWeek + daysInMonth);

    const lastVisibleDate = new Date(
      currentYear,
      currentMonth + 1,
      remainingDays
    );

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;
    };

    return `${formatDate(firstVisibleDate)}-${formatDate(lastVisibleDate)}`;
  };

  const currentMonthDataset = getVisibleDates(selectedDateCurr);
  const previousMonthDataset = getVisibleDates(selectedDatePrev);

  const { data, loading, error } = useQuery<{ accountManager: AccountManager }>(
    GET_ACCOUNT_MANAGER,
    {
      variables: {
        slug,
        dataset: selectedDataset.replace("timesheet-", ""),
        dataset1: previousMonthDataset,
        dataset2: currentMonthDataset,
      },
    }
  );

  const getSelectedSummary = (
    timesheet: any,
    selectedDay: number | null,
    selectedRow: number | null,
    selectedColumn: number | null,
    isAllSelected: boolean,
    selectedDate: Date,
    selectedStatType: StatType
  ) => {
    if (!selectedDay && !selectedRow && !selectedColumn && !isAllSelected)
      return null;

    const clientData: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number, slug: string } } = {};
    const sponsorData: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number, slug: string } } = {};
    const workerData: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number, slug: string } } = {};
    const clientAppointments: { [key: string]: any[] } = {};
    const sponsorAppointments: { [key: string]: any[] } = {};
    const workerAppointments: { [key: string]: any[] } = {};

    timesheet.appointments.forEach((appointment: any) => {
      console.log('Appointment worker data:', {
        name: appointment.workerName,
        slug: appointment.workerSlug
      });
      const appointmentDate = new Date(appointment.date);
      const dayOfMonth = appointmentDate.getUTCDate();
      const dayOfWeek = appointmentDate.getUTCDay();
      const appointmentMonth = appointmentDate.getUTCMonth();
      
      const firstDayOfMonth = new Date(appointmentDate.getUTCFullYear(), appointmentDate.getUTCMonth(), 1);
      const firstDayOffset = firstDayOfMonth.getUTCDay();

      const weekIndex = Math.floor((dayOfMonth + firstDayOffset - 1) / 7);

      const shouldInclude = (isAllSelected || 
        (selectedDay !== null && dayOfMonth === selectedDay) ||
        (selectedRow !== null && weekIndex === selectedRow) ||
        (selectedColumn !== null && dayOfWeek === selectedColumn)) &&
        appointmentMonth === selectedDate.getMonth();

      if (shouldInclude) {
        const clientKey = appointment.clientName;
        const sponsorKey = appointment.sponsor;
        const workerKey = appointment.workerName;

        [
          { data: clientData, key: clientKey, slug: appointment.clientSlug, appointments: clientAppointments },
          { data: sponsorData, key: sponsorKey, slug: appointment.sponsorSlug, appointments: sponsorAppointments },
          { data: workerData, key: workerKey, slug: appointment.workerSlug, appointments: workerAppointments }
        ].forEach(({ data, key, slug, appointments }) => {
          if (!data[key]) {
            data[key] = {
              total: 0,
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0,
              slug
            };
          }
          if (!appointments[key]) {
            appointments[key] = [];
          }

          data[key].total += appointment.timeInHs;
          switch(appointment.kind.toLowerCase()) {
            case 'consulting':
              data[key].consulting += appointment.timeInHs;
              break;
            case 'handson':
              data[key].handsOn += appointment.timeInHs;
              break;
            case 'squad':
              data[key].squad += appointment.timeInHs;
              break;
            case 'internal':
              data[key].internal += appointment.timeInHs;
              break;
          }

          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          appointments[key].push({
            ...appointment,
            date: `${days[appointmentDate.getUTCDay()]} ${appointmentDate.getUTCDate()}`
          });
        });
      }
    });

    const createSummaries = (data: any, appointments: any, type: "client" | "sponsor" | "worker") => {
      return Object.entries(data)
        .map(([key, value]: [string, any]) => {
          const summary = {
            hours: value[selectedStatType],
            appointments: appointments[key]?.filter((apt: any) => 
              apt.kind.toLowerCase() === selectedStatType ||
              (selectedStatType === 'handsOn' && apt.kind.toLowerCase() === 'handson')
            )
          };

          switch(type) {
            case "client":
              return {
                ...summary,
                client: key,
                clientSlug: value.slug
              } as ClientSummary;
            case "sponsor":
              return {
                ...summary,
                sponsor: key,
                sponsorSlug: value.slug
              } as SponsorSummary;
            case "worker":
              return {
                ...summary,
                workerName: key,
                workerSlug: value.slug
              } as WorkerSummary;
          }
        })
        .filter(summary => summary.hours > 0)
        .sort((a, b) => b.hours - a.hours);
    };

    return {
      client: createSummaries(clientData, clientAppointments, "client"),
      sponsor: createSummaries(sponsorData, sponsorAppointments, "sponsor"),
      worker: createSummaries(workerData, workerAppointments, "worker")
    };
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.accountManager) return <div>Manager not found</div>;

  const {
    name,
    position,
    photoUrl,
    timesheet1,
    timesheet2,
    cases,
    activeDeals,
  } = data.accountManager;

  return (
    <div className="w-full p-2">
      <header className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600">{position}</p>
        </div>
      </header>

      {getFlag("is-fin-user", session?.user?.email) && (
        <div className="mt-4">
          <RevenueProgression data={data.accountManager} />
        </div>
      )}

      <SectionHeader title="Side by Side Analysis" subtitle="" />

      <div className="ml-2 mr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <AllocationCalendar
              selectedDate={selectedDatePrev}
              setSelectedDate={setSelectedDatePrev}
              selectedDay={selectedDayPrev}
              setSelectedDay={setSelectedDayPrev}
              selectedRow={selectedRowPrev}
              setSelectedRow={setSelectedRowPrev}
              selectedColumn={selectedColumnPrev}
              setSelectedColumn={setSelectedColumnPrev}
              isAllSelected={isAllSelectedPrev}
              setIsAllSelected={setIsAllSelectedPrev}
              timesheet={timesheet1}
              selectedStatType={selectedStatTypePrev}
              setSelectedStatType={setSelectedStatTypePrev}
            />
            {getSelectedSummary(
              timesheet1,
              selectedDayPrev,
              selectedRowPrev,
              selectedColumnPrev,
              isAllSelectedPrev,
              selectedDatePrev,
              selectedStatTypePrev
            ) && (
              <Tabs defaultValue="client" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="client">By Client</TabsTrigger>
                  <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
                  <TabsTrigger value="worker">By Worker</TabsTrigger>
                </TabsList>
                <TabsContent value="client">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet1,
                      selectedDayPrev,
                      selectedRowPrev,
                      selectedColumnPrev,
                      isAllSelectedPrev,
                      selectedDatePrev,
                      selectedStatTypePrev
                    )?.client || null}
                    selectedStatType={selectedStatTypePrev}
                    type="client"
                  />
                </TabsContent>
                <TabsContent value="sponsor">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet1,
                      selectedDayPrev,
                      selectedRowPrev,
                      selectedColumnPrev,
                      isAllSelectedPrev,
                      selectedDatePrev,
                      selectedStatTypePrev
                    )?.sponsor || null}
                    selectedStatType={selectedStatTypePrev}
                    type="sponsor"
                  />
                </TabsContent>
                <TabsContent value="worker">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet1,
                      selectedDayPrev,
                      selectedRowPrev,
                      selectedColumnPrev,
                      isAllSelectedPrev,
                      selectedDatePrev,
                      selectedStatTypePrev
                    )?.worker || null}
                    selectedStatType={selectedStatTypePrev}
                    type="worker"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
          <div>
            <AllocationCalendar
              selectedDate={selectedDateCurr}
              setSelectedDate={setSelectedDateCurr}
              selectedDay={selectedDayCurr}
              setSelectedDay={setSelectedDayCurr}
              selectedRow={selectedRowCurr}
              setSelectedRow={setSelectedRowCurr}
              selectedColumn={selectedColumnCurr}
              setSelectedColumn={setSelectedColumnCurr}
              isAllSelected={isAllSelectedCurr}
              setIsAllSelected={setIsAllSelectedCurr}
              timesheet={timesheet2}
              selectedStatType={selectedStatTypeCurr}
              setSelectedStatType={setSelectedStatTypeCurr}
            />
            {getSelectedSummary(
              timesheet2,
              selectedDayCurr,
              selectedRowCurr,
              selectedColumnCurr,
              isAllSelectedCurr,
              selectedDateCurr,
              selectedStatTypeCurr
            ) && (
              <Tabs defaultValue="client" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="client">By Client</TabsTrigger>
                  <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
                  <TabsTrigger value="worker">By Worker</TabsTrigger>
                </TabsList>
                <TabsContent value="client">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet2,
                      selectedDayCurr,
                      selectedRowCurr,
                      selectedColumnCurr,
                      isAllSelectedCurr,
                      selectedDateCurr,
                      selectedStatTypeCurr
                    )?.client || null}
                    selectedStatType={selectedStatTypeCurr}
                    type="client"
                  />
                </TabsContent>
                <TabsContent value="sponsor">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet2,
                      selectedDayCurr,
                      selectedRowCurr,
                      selectedColumnCurr,
                      isAllSelectedCurr,
                      selectedDateCurr,
                      selectedStatTypeCurr
                    )?.sponsor || null}
                    selectedStatType={selectedStatTypeCurr}
                    type="sponsor"
                  />
                </TabsContent>
                <TabsContent value="worker">
                  <SummarySection
                    summaries={getSelectedSummary(
                      timesheet2,
                      selectedDayCurr,
                      selectedRowCurr,
                      selectedColumnCurr,
                      isAllSelectedCurr,
                      selectedDateCurr,
                      selectedStatTypeCurr
                    )?.worker || null}
                    selectedStatType={selectedStatTypeCurr}
                    type="worker"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <TimesheetSummary
          timesheet={data.accountManager.timesheet}
          selectedDataset={selectedDataset}
          onDatasetSelect={setSelectedDataset}
        />

        <CasesSummary cases={cases} />
        <ActiveDealsSummary activeDeals={activeDeals} />
      </div>
    </div>
  );
}
