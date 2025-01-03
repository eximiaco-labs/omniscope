  "use client";

  import React, { useState, useEffect } from "react";
  import { useQuery } from "@apollo/client";
  import { useParams, useRouter, useSearchParams } from "next/navigation";
  import { GET_SPONSOR_BY_SLUG, GET_SPONSOR_TIMESHEET } from "./queries";
  import { SponsorHeader } from "./SponsorHeader";
  import TopWorkers from "@/app/components/panels/TopWorkers";
  import TopClients from "@/app/components/panels/TopClients";
  import DatasetSelector from "@/app/analytics/datasets/DatasetSelector";
  import { Stat } from "@/app/components/analytics/stat";
  import { Divider } from "@/components/catalyst/divider";
  import { CasesGallery } from "../../cases/CasesGallery";
  import { CasesTable } from "../../clients/[slug]/CasesTable";
  import { AllocationCalendar } from "@/app/components/AllocationCalendar";
  import { StatType } from "@/app/constants/colors";
  import Link from "next/link";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  import SectionHeader from "@/components/SectionHeader";
  import { getFlag } from "@/app/flags";
  import { RevenueProgression } from "@/app/financial/revenue-forecast/RevenueProgression";
  import { useSession } from "next-auth/react";
import OneYearAllocation from "@/app/components/OneYearAllocation";

  interface WorkerSummary {
    worker: string;
    workerSlug: string;
    hours: number;
    appointments: any[];
  }

  interface CaseSummary {
    caseTitle: string;
    caseId: string;
    hours: number;
    appointments: any[];
  }

  const SummarySection = ({
    summaries,
    selectedStatType,
    type,
  }: {
    summaries: (WorkerSummary | CaseSummary)[] | null;
    selectedStatType: StatType;
    type: "worker" | "case";
  }) => {
    if (!summaries) return null;

    const filteredSummaries = summaries.filter((summary) => summary.hours > 0);

    if (filteredSummaries.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">
          {type === "worker" ? "Worker" : "Case"} Summary:
        </h3>
        {filteredSummaries.map((summary) => (
          <div
            key={
              type === "worker"
                ? (summary as WorkerSummary).worker
                : (summary as CaseSummary).caseId
            }
            className="flex justify-between items-center py-1"
          >
            <Link
              href={
                type === "worker"
                  ? `/about-us/consultants-and-engineers/${
                      (summary as WorkerSummary).workerSlug
                    }`
                  : `/about-us/cases/${(summary as CaseSummary).caseId}`
              }
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {type === "worker"
                ? (summary as WorkerSummary).worker
                : (summary as CaseSummary).caseTitle}
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
                      {type === "worker"
                        ? (summary as WorkerSummary).worker
                        : (summary as CaseSummary).caseTitle}{" "}
                      -{" "}
                      {selectedStatType.charAt(0).toUpperCase() +
                        selectedStatType.slice(1)}{" "}
                      Hours
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Hours</TableHead>
                          {type === "case" && (
                            <TableHead className="text-xs">Worker</TableHead>
                          )}
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
                              {apt.timeInHs}h
                            </TableCell>
                            {type === "case" && (
                              <TableCell className="text-xs">
                                <Link
                                  href={`/about-us/consultants-and-engineers/${apt.workerSlug}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {apt.workerName}
                                </Link>
                              </TableCell>
                            )}
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
        ))}
      </div>
    );
  };

  export default function SponsorPage() {
    const { slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    
    const [selectedDataset, setSelectedDataset] = useState<string>(
      "timesheet-last-six-weeks"
    );
    const [selectedStat, setSelectedStat] = useState("total");

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

    const {
      data: sponsorData,
      loading: sponsorLoading,
      error: sponsorError,
    } = useQuery(GET_SPONSOR_BY_SLUG, {
      variables: {
        slug,
        dataset1: previousMonthDataset,
        dataset2: currentMonthDataset,
      },
    });

    const {
      data: timesheetData,
      loading: timesheetLoading,
      error: timesheetError,
    } = useQuery(GET_SPONSOR_TIMESHEET, {
      variables: {
        sponsorName: sponsorData?.sponsor?.name,
        datasetSlug: selectedDataset,
      },
      skip: !selectedDataset || !sponsorData?.sponsor?.name,
    });

    useEffect(() => {
      const datasetParam = searchParams.get("dataset");
      if (datasetParam) {
        setSelectedDataset(datasetParam);
      }
    }, [searchParams]);

    const handleDatasetSelect = (value: string) => {
      setSelectedDataset(value);
      router.push(`/about-us/sponsors/${slug}?dataset=${value}`);
    };

    const handleStatClick = (statName: string) => {
      setSelectedStat(statName === selectedStat ? "total" : statName);
    };

    const getStatClassName = (statName: string) => {
      return `cursor-pointer transition-all duration-300 ${
        selectedStat === statName
          ? "ring-2 ring-black shadow-lg scale-105"
          : "hover:scale-102"
      }`;
    };

    const getSelectedSummary = (
      timesheet: any,
      selectedDay: number | null,
      selectedRow: number | null,
      selectedColumn: number | null,
      isAllSelected: boolean,
      selectedDate: Date,
      selectedStatType: StatType
    ): (WorkerSummary | CaseSummary)[] | null => {
      if (!selectedDay && !selectedRow && !selectedColumn && !isAllSelected)
        return null;

      const workerSummaryData: {
        [key: string]: {
          total: number;
          consulting: number;
          handsOn: number;
          squad: number;
          internal: number;
          slug: string;
        };
      } = {};
      const caseSummaryData: {
        [key: string]: {
          total: number;
          consulting: number;
          handsOn: number;
          squad: number;
          internal: number;
          id: string;
          title: string;
        };
      } = {};
      const workerAppointments: { [key: string]: any[] } = {};
      const caseAppointments: { [key: string]: any[] } = {};

      timesheet?.appointments?.forEach((appointment: any) => {
        const appointmentDate = new Date(appointment.date);
        const dayOfMonth = appointmentDate.getUTCDate();
        const dayOfWeek = appointmentDate.getUTCDay();
        const appointmentMonth = appointmentDate.getUTCMonth();

        const firstDayOfMonth = new Date(
          appointmentDate.getUTCFullYear(),
          appointmentDate.getUTCMonth(),
          1
        );
        const firstDayOffset = firstDayOfMonth.getUTCDay();

        const weekIndex = Math.floor((dayOfMonth + firstDayOffset - 1) / 7);

        const shouldInclude =
          (isAllSelected ||
            (selectedDay !== null && dayOfMonth === selectedDay) ||
            (selectedRow !== null && weekIndex === selectedRow) ||
            (selectedColumn !== null && dayOfWeek === selectedColumn)) &&
          appointmentMonth === selectedDate.getMonth();

        if (shouldInclude) {
          const workerKey = appointment.workerName;
          const caseKey = appointment.caseId;

          // Worker summary
          if (!workerSummaryData[workerKey]) {
            workerSummaryData[workerKey] = {
              total: 0,
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0,
              slug: appointment.workerSlug,
            };
          }

          // Case summary
          if (!caseSummaryData[caseKey]) {
            caseSummaryData[caseKey] = {
              total: 0,
              consulting: 0,
              handsOn: 0,
              squad: 0,
              internal: 0,
              id: appointment.caseId,
              title: appointment.caseTitle,
            };
          }

          const dayData = timesheet?.byDate?.find(
            (d: any) =>
              new Date(d.date).getUTCDate() === dayOfMonth &&
              new Date(d.date).getUTCMonth() === appointmentMonth
          );

          if (dayData) {
            workerSummaryData[workerKey].total += appointment.timeInHs;
            caseSummaryData[caseKey].total += appointment.timeInHs;

            switch (appointment.kind.toLowerCase()) {
              case "consulting":
                workerSummaryData[workerKey].consulting += appointment.timeInHs;
                caseSummaryData[caseKey].consulting += appointment.timeInHs;
                break;
              case "handson":
                workerSummaryData[workerKey].handsOn += appointment.timeInHs;
                caseSummaryData[caseKey].handsOn += appointment.timeInHs;
                break;
              case "squad":
                workerSummaryData[workerKey].squad += appointment.timeInHs;
                caseSummaryData[caseKey].squad += appointment.timeInHs;
                break;
              case "internal":
                workerSummaryData[workerKey].internal += appointment.timeInHs;
                caseSummaryData[caseKey].internal += appointment.timeInHs;
                break;
            }

            if (!workerAppointments[workerKey]) {
              workerAppointments[workerKey] = [];
            }
            if (!caseAppointments[caseKey]) {
              caseAppointments[caseKey] = [];
            }

            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const formattedAppointment = {
              ...appointment,
              date: `${
                days[appointmentDate.getUTCDay()]
              } ${appointmentDate.getUTCDate()}`,
            };

            workerAppointments[workerKey].push(formattedAppointment);
            caseAppointments[caseKey].push(formattedAppointment);
          }
        }
      });

      const createSummaries = (type: "worker" | "case") => {
        const data = type === "worker" ? workerSummaryData : caseSummaryData;
        const appointments =
          type === "worker" ? workerAppointments : caseAppointments;

        return Object.entries(data)
          .map(([key, value]) => {
            const summary = {
              hours: value[selectedStatType],
              appointments:
                appointments[key]?.filter(
                  (apt) =>
                    apt.kind.toLowerCase() === selectedStatType ||
                    (selectedStatType === "handsOn" &&
                      apt.kind.toLowerCase() === "handson")
                ) || [],
            };

            if (type === "worker") {
              return {
                ...summary,
                worker: key,
                workerSlug: value.slug,
              } as WorkerSummary;
            } else {
              return {
                ...summary,
                caseTitle: value.title,
                caseId: value.id,
              } as CaseSummary;
            }
          })
          .filter((summary) => summary.hours > 0)
          .sort((a, b) => b.hours - a.hours);
      };

      return [...createSummaries("worker"), ...createSummaries("case")];
    };

    if (sponsorLoading) return <p>Loading sponsor data...</p>;
    if (sponsorError) return <p>Error loading sponsor: {sponsorError.message}</p>;

    const { timesheet1, timesheet2 } = sponsorData.sponsor;

    const prevSummaries = getSelectedSummary(
      timesheet1,
      selectedDayPrev,
      selectedRowPrev,
      selectedColumnPrev,
      isAllSelectedPrev,
      selectedDatePrev,
      selectedStatTypePrev
    );

    const currSummaries = getSelectedSummary(
      timesheet2,
      selectedDayCurr,
      selectedRowCurr,
      selectedColumnCurr,
      isAllSelectedCurr,
      selectedDateCurr,
      selectedStatTypeCurr
    );

    return (
      <div>
        {sponsorData?.sponsor && (
          <SponsorHeader
            sponsor={{
              name: sponsorData.sponsor.name,
              photoUrl: sponsorData.sponsor.photoUrl,
              jobTitle: sponsorData.sponsor.jobTitle,
              linkedinUrl: sponsorData.sponsor.linkedinUrl,
              client: {
                id: sponsorData.sponsor.client?.id,
                name: sponsorData.sponsor.client?.name,
              },
            }}
          />
        )}

        {getFlag("is-fin-user", session?.user?.email) && (
          <div className="mt-4">
            <RevenueProgression data={sponsorData.sponsor} />
          </div>
        )}

        <OneYearAllocation sponsor={sponsorData.sponsor.name} />

        <div className="mt-4">
          <section>
            <SectionHeader title="Side by Side Analysis" subtitle="" />
            <div className="grid grid-cols-2 gap-4 mr-2 ml-2">
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
                {prevSummaries && (
                  <Tabs defaultValue="worker" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="worker">By Worker</TabsTrigger>
                      <TabsTrigger value="case">By Case</TabsTrigger>
                    </TabsList>
                    <TabsContent value="worker">
                      <SummarySection
                        summaries={
                          prevSummaries?.filter((s) => "worker" in s) || null
                        }
                        selectedStatType={selectedStatTypePrev}
                        type="worker"
                      />
                    </TabsContent>
                    <TabsContent value="case">
                      <SummarySection
                        summaries={
                          prevSummaries?.filter((s) => "caseId" in s) || null
                        }
                        selectedStatType={selectedStatTypePrev}
                        type="case"
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
                {currSummaries && (
                  <Tabs defaultValue="worker" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="worker">By Worker</TabsTrigger>
                      <TabsTrigger value="case">By Case</TabsTrigger>
                    </TabsList>
                    <TabsContent value="worker">
                      <SummarySection
                        summaries={
                          currSummaries?.filter((s) => "worker" in s) || null
                        }
                        selectedStatType={selectedStatTypeCurr}
                        type="worker"
                      />
                    </TabsContent>
                    <TabsContent value="case">
                      <SummarySection
                        summaries={
                          currSummaries?.filter((s) => "caseId" in s) || null
                        }
                        selectedStatType={selectedStatTypeCurr}
                        type="case"
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </section>

          <section className="">
            <SectionHeader title="Allocation" subtitle="" />
            <div className="ml-2 mr-2">
              <div className="mt-4 mb-4">
                <DatasetSelector
                  selectedDataset={selectedDataset}
                  onDatasetSelect={handleDatasetSelect}
                />
              </div>

              {timesheetLoading ? (
                <p>Loading timesheet data...</p>
              ) : timesheetError ? (
                <p>Error loading timesheet: {timesheetError.message}</p>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div
                      className={`${getStatClassName("total")} transform`}
                      onClick={() => handleStatClick("total")}
                    >
                      <Stat
                        title="Total Hours"
                        value={
                          timesheetData?.timesheet?.totalHours?.toString() || "0"
                        }
                      />
                    </div>
                    <div
                      className={`${getStatClassName("consulting")} transform`}
                      onClick={() => handleStatClick("consulting")}
                    >
                      <Stat
                        title="Consulting Hours"
                        value={
                          timesheetData?.timesheet?.byKind?.consulting?.totalHours?.toString() ||
                          "0"
                        }
                        color="#F59E0B"
                        total={timesheetData?.timesheet?.totalHours}
                      />
                    </div>
                    <div
                      className={`${getStatClassName("handsOn")} transform`}
                      onClick={() => handleStatClick("handsOn")}
                    >
                      <Stat
                        title="Hands-On Hours"
                        value={
                          timesheetData?.timesheet?.byKind?.handsOn?.totalHours?.toString() ||
                          "0"
                        }
                        color="#8B5CF6"
                        total={timesheetData?.timesheet?.totalHours}
                      />
                    </div>
                    <div
                      className={`${getStatClassName("squad")} transform`}
                      onClick={() => handleStatClick("squad")}
                    >
                      <Stat
                        title="Squad Hours"
                        value={
                          timesheetData?.timesheet?.byKind?.squad?.totalHours?.toString() ||
                          "0"
                        }
                        color="#3B82F6"
                        total={timesheetData?.timesheet?.totalHours}
                      />
                    </div>
                    <div
                      className={`${getStatClassName("internal")} transform`}
                      onClick={() => handleStatClick("internal")}
                    >
                      <Stat
                        title="Internal Hours"
                        value={
                          timesheetData?.timesheet?.byKind?.internal?.totalHours?.toString() ||
                          "0"
                        }
                        color="#10B981"
                        total={timesheetData?.timesheet?.totalHours}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <CasesTable
                      filteredCases={timesheetData?.timesheet?.byCase || []}
                      showSponsorColumn={false}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }
