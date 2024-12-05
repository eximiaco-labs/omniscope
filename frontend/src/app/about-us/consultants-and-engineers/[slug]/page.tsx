"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CONSULTANT, Consultant } from "./queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatType } from "@/app/constants/colors";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

interface ClientSummary {
  client: string;
  clientSlug: string;
  hours: number;
  appointments: any[];
}

interface SponsorSummary {
  sponsor: string;
  sponsorSlug: string;
  hours: number;
  appointments: any[];
}

type Summary = ClientSummary | SponsorSummary;

function isClientSummary(summary: Summary): summary is ClientSummary {
  return 'client' in summary;
}

const SummarySection = ({ 
  summaries, 
  selectedStatType,
  type
}: {
  summaries: Summary[] | null;
  selectedStatType: StatType;
  type: "client" | "sponsor";
}) => {
  if (!summaries) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">{type === "client" ? "Client" : "Sponsor"} Summary:</h3>
      {summaries.map((summary) => (
        <div key={isClientSummary(summary) ? summary.client : summary.sponsor} className="flex justify-between items-center py-1">
          <div className="flex items-center gap-2">
            <Link 
              href={`/about-us/${type === "client" ? "clients" : "sponsors"}/${isClientSummary(summary) ? summary.clientSlug : summary.sponsorSlug}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {isClientSummary(summary) ? summary.client : summary.sponsor}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span>{summary.hours.toFixed(1)}h</span>
            <Sheet>
              <SheetTrigger className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Details
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    {isClientSummary(summary) ? summary.client : summary.sponsor} - {selectedStatType.charAt(0).toUpperCase() + selectedStatType.slice(1)} Hours
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Hours</TableHead>
                        <TableHead className="text-xs">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.appointments.map((apt, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs">{apt.date}</TableCell>
                          <TableCell className="text-xs">{apt.timeInHs}h</TableCell>
                          <TableCell className="text-gray-600 text-xs">{apt.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ConsultantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedDateCurr, setSelectedDateCurr] = useState(new Date());
  const [selectedDatePrev, setSelectedDatePrev] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );

  // Previous month states
  const [selectedDayPrev, setSelectedDayPrev] = useState<number | null>(null);
  const [selectedRowPrev, setSelectedRowPrev] = useState<number | null>(null);
  const [selectedColumnPrev, setSelectedColumnPrev] = useState<number | null>(null);
  const [isAllSelectedPrev, setIsAllSelectedPrev] = useState(false);
  const [selectedStatTypePrev, setSelectedStatTypePrev] = useState<StatType>('consulting');

  // Current month states
  const [selectedDayCurr, setSelectedDayCurr] = useState<number | null>(null);
  const [selectedRowCurr, setSelectedRowCurr] = useState<number | null>(null);
  const [selectedColumnCurr, setSelectedColumnCurr] = useState<number | null>(null);
  const [isAllSelectedCurr, setIsAllSelectedCurr] = useState(false);
  const [selectedStatTypeCurr, setSelectedStatTypeCurr] = useState<StatType>('consulting');

  // Calculate visible dates for both datasets
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

  const { data, loading, error } = useQuery<{
    consultantOrEngineer: Consultant;
  }>(GET_CONSULTANT, {
    variables: {
      slug,
      dataset1: previousMonthDataset,
      dataset2: currentMonthDataset,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.consultantOrEngineer) return <div>Consultant not found</div>;

  const { name, position, photoUrl, timesheet1, timesheet2 } =
    data.consultantOrEngineer;

  const getSelectedSummary = (timesheet: any, selectedDay: number | null, selectedRow: number | null, selectedColumn: number | null, isAllSelected: boolean, selectedDate: Date, selectedStatType: StatType) => {
    if (!selectedDay && !selectedRow && !selectedColumn && !isAllSelected) return null;

    const clientData: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number, slug: string } } = {};
    const sponsorData: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number, slug: string } } = {};
    const clientAppointments: { [key: string]: any[] } = {};
    const sponsorAppointments: { [key: string]: any[] } = {};
    
    timesheet.appointments.forEach((appointment: {
      date: string;
      clientName: string;
      clientSlug: string;
      sponsor: string;
      sponsorSlug: string;
      timeInHs: number;
      comment: string;
      kind: string;
    }) => {
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

        // Initialize client data
        if (!clientData[clientKey]) {
          clientData[clientKey] = {
            total: 0,
            consulting: 0,
            handsOn: 0,
            squad: 0,
            internal: 0,
            slug: appointment.clientSlug
          };
        }

        // Initialize sponsor data
        if (!sponsorData[sponsorKey]) {
          sponsorData[sponsorKey] = {
            total: 0,
            consulting: 0,
            handsOn: 0,
            squad: 0,
            internal: 0,
            slug: appointment.sponsorSlug
          };
        }

        clientData[clientKey].total += appointment.timeInHs;
        sponsorData[sponsorKey].total += appointment.timeInHs;
        
        // Map appointment kind to hours type
        switch(appointment.kind.toLowerCase()) {
          case 'consulting':
            clientData[clientKey].consulting += appointment.timeInHs;
            sponsorData[sponsorKey].consulting += appointment.timeInHs;
            break;
          case 'handson':
            clientData[clientKey].handsOn += appointment.timeInHs;
            sponsorData[sponsorKey].handsOn += appointment.timeInHs;
            break;
          case 'squad':
            clientData[clientKey].squad += appointment.timeInHs;
            sponsorData[sponsorKey].squad += appointment.timeInHs;
            break;
          case 'internal':
            clientData[clientKey].internal += appointment.timeInHs;
            sponsorData[sponsorKey].internal += appointment.timeInHs;
            break;
        }

        if (!clientAppointments[clientKey]) {
          clientAppointments[clientKey] = [];
        }
        if (!sponsorAppointments[sponsorKey]) {
          sponsorAppointments[sponsorKey] = [];
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedAppointment = {
          ...appointment,
          date: `${days[appointmentDate.getUTCDay()]} ${appointmentDate.getUTCDate()}`
        };

        clientAppointments[clientKey].push(formattedAppointment);
        sponsorAppointments[sponsorKey].push(formattedAppointment);
      }
    });

    const createSummaries = (type: "client" | "sponsor") => {
      const data = type === "client" ? clientData : sponsorData;
      const appointments = type === "client" ? clientAppointments : sponsorAppointments;

      return Object.entries(data)
        .map(([key, value]) => {
          const summary = {
            hours: value[selectedStatType],
            appointments: appointments[key]?.filter(apt => 
              apt.kind.toLowerCase() === selectedStatType ||
              (selectedStatType === 'handsOn' && apt.kind.toLowerCase() === 'handson')
            )
          };

          if (type === "client") {
            return {
              ...summary,
              client: key,
              clientSlug: value.slug
            } as ClientSummary;
          } else {
            return {
              ...summary,
              sponsor: key,
              sponsorSlug: value.slug
            } as SponsorSummary;
          }
        })
        .filter(summary => summary.hours > 0)
        .sort((a, b) => b.hours - a.hours);
    };

    return [...createSummaries("client"), ...createSummaries("sponsor")];
  };

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600">{position}</p>
        </div>
      </div>

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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="client">By Client</TabsTrigger>
                  <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
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
                    )?.filter((s) => "client" in s) || null}
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
                    )?.filter((s) => "sponsor" in s) || null}
                    selectedStatType={selectedStatTypePrev}
                    type="sponsor"
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="client">By Client</TabsTrigger>
                  <TabsTrigger value="sponsor">By Sponsor</TabsTrigger>
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
                    )?.filter((s) => "client" in s) || null}
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
                    )?.filter((s) => "sponsor" in s) || null}
                    selectedStatType={selectedStatTypeCurr}
                    type="sponsor"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
