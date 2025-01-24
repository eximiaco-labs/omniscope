interface ForecastItem {
  name?: string;
  title?: string;
  slug: string;
  clientSlug?: string;
  sponsorSlug?: string;
  caseSlug?: string;
  sameDayThreeMonthsAgo: number;
  normalizedSameDayThreeMonthsAgo: number;
  threeMonthsAgo: number;
  normalizedThreeMonthsAgo: number;
  sameDayTwoMonthsAgo: number;
  normalizedSameDayTwoMonthsAgo: number;
  twoMonthsAgo: number;
  normalizedTwoMonthsAgo: number;
  sameDayOneMonthAgo: number;
  normalizedSameDayOneMonthAgo: number;
  oneMonthAgo: number;
  normalizedOneMonthAgo: number;
  realized: number;
  normalizedRealized: number;
  projected: number;
  normalizedProjected: number;
  expected: number;
  normalizedExpected: number;
  expectedHistorical: number;
  normalizedExpectedHistorical: number;
  expectedOneMonthLater?: number;
  normalizedExpectedOneMonthLater?: number;
  expectedTwoMonthsLater?: number;
  normalizedExpectedTwoMonthsLater?: number;
  expectedThreeMonthsLater?: number;
  normalizedExpectedThreeMonthsLater?: number;
  inAnalysisConsultingHours?: number;
  normalizedInAnalysisConsultingHours?: number;    
  sameDayThreeMonthsAgoConsultingHours?: number;
  normalizedSameDayThreeMonthsAgoConsultingHours?: number;
  threeMonthsAgoConsultingHours?: number;
  normalizedThreeMonthsAgoConsultingHours?: number;
  sameDayTwoMonthsAgoConsultingHours?: number;
  normalizedSameDayTwoMonthsAgoConsultingHours?: number;
  twoMonthsAgoConsultingHours?: number;
  normalizedTwoMonthsAgoConsultingHours?: number;
  sameDayOneMonthAgoConsultingHours?: number;
  normalizedSameDayOneMonthAgoConsultingHours?: number;
  oneMonthAgoConsultingHours?: number;
  normalizedOneMonthAgoConsultingHours?: number;
  consultingPreHours?: number;
  normalizedConsultingPreHours?: number;
  threeMonthsAgoConsultingPreHours?: number;
  normalizedThreeMonthsAgoConsultingPreHours?: number;
  twoMonthsAgoConsultingPreHours?: number;
  normalizedTwoMonthsAgoConsultingPreHours?: number;
  oneMonthAgoConsultingPreHours?: number;
  normalizedOneMonthAgoConsultingPreHours?: number;
  startOfContract?: string;
  endOfContract?: string;
  weeklyApprovedHours?: number;
}

interface ForecastTotals {
  sameDayThreeMonthsAgo: number;
  normalizedSameDayThreeMonthsAgo: number;
  threeMonthsAgo: number;
  threeMonthsAgoConsultingFeeNew?: number;
  normalizedThreeMonthsAgo: number;
  sameDayTwoMonthsAgo: number;
  sameDayTwoMonthsAgoConsultingFeeNew?: number;
  normalizedSameDayTwoMonthsAgo: number;
  twoMonthsAgo: number;
  twoMonthsAgoConsultingFeeNew?: number;
  normalizedTwoMonthsAgo: number;
  sameDayOneMonthAgo: number;
  sameDayOneMonthAgoConsultingFeeNew?: number;
  normalizedSameDayOneMonthAgo: number;
  oneMonthAgo: number;
  oneMonthAgoConsultingFeeNew?: number;
  normalizedOneMonthAgo: number;
  realized: number;
  realizedConsultingFeeNew?: number;
  normalizedRealized: number;
  projected: number;
  normalizedProjected: number;
  expected: number;
  normalizedExpected: number;
  expectedHistorical: number;
  normalizedExpectedHistorical: number;
  inAnalysisConsultingHours?: number;
  normalizedInAnalysisConsultingHours?: number;
  oneMonthAgoConsultingHours?: number;
  normalizedOneMonthAgoConsultingHours?: number;
  twoMonthsAgoConsultingHours?: number;
  normalizedTwoMonthsAgoConsultingHours?: number;
  threeMonthsAgoConsultingHours?: number;
  normalizedThreeMonthsAgoConsultingHours?: number;
  sameDayOneMonthAgoConsultingHours?: number;
  normalizedSameDayOneMonthAgoConsultingHours?: number;
  sameDayTwoMonthsAgoConsultingHours?: number;
  normalizedSameDayTwoMonthsAgoConsultingHours?: number;
  sameDayThreeMonthsAgoConsultingHours?: number;
  normalizedSameDayThreeMonthsAgoConsultingHours?: number;
  inAnalysisConsultingPreHours?: number;
  normalizedInAnalysisConsultingPreHours?: number;
  threeMonthsAgoConsultingPreHours?: number;
  normalizedThreeMonthsAgoConsultingPreHours?: number;
  twoMonthsAgoConsultingPreHours?: number;
  normalizedTwoMonthsAgoConsultingPreHours?: number;
  oneMonthAgoConsultingPreHours?: number;
  normalizedOneMonthAgoConsultingPreHours?: number;
}

interface ForecastSection {
  clients: ForecastItem[];
  sponsors: ForecastItem[];
  cases: ForecastItem[];
  projects: ForecastItem[];
  consultants: ForecastItem[];
  totals: ForecastTotals;
}

export interface DailyData {
  date: string;
  actual: {
    totalConsultingFee: number;
    totalConsultingHours: number;
    accTotalConsultingFee: number;
    accTotalConsultingHours: number;
  };
  expected: {
    totalConsultingFee: number;
    totalConsultingHours: number;
    accTotalConsultingFee: number;
    accTotalConsultingHours: number;
  };
  difference: {
    totalConsultingFee: number;
    totalConsultingHours: number;
    accTotalConsultingFee: number;
    accTotalConsultingHours: number;
  };
}

interface ForecastData {
  daily: DailyData[];
  consulting: ForecastSection;
  consultingPre: {
    clients: Array<{
      name: string;
      slug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgoConsultingPreHours: number;
      inAnalysisConsultingPreHours: number;
    }>;
    sponsors: Array<{
      name: string;
      slug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgoConsultingPreHours: number;
      inAnalysisConsultingPreHours: number;
    }>;
    cases: Array<{
      title: string;
      slug: string;
      sponsorSlug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgoConsultingPreHours: number;
      inAnalysisConsultingPreHours: number;
    }>;
    projects: Array<{
      name: string;
      slug: string;
      caseSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgoConsultingPreHours: number;
      inAnalysisConsultingPreHours: number;
    }>;
    totals: {
      threeMonthsAgo: number;
      threeMonthsAgoConsultingPreHours: number;
      twoMonthsAgo: number;
      twoMonthsAgoConsultingPreHours: number;
      oneMonthAgo: number;
      oneMonthAgoConsultingPreHours: number;
      current: number;
      inAnalysisConsultingPreHours: number;
    };
  };
  handsOn: {
    clients: Array<{
      name: string;
      slug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    sponsors: Array<{
      name: string;
      slug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    cases: Array<{
      title: string;
      slug: string;
      sponsorSlug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    projects: Array<{
      name: string;
      slug: string;
      caseSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    totals: {
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    };
  };
  squad: {
    clients: Array<{
      name: string;
      slug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    sponsors: Array<{
      name: string;
      slug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    cases: Array<{
      title: string;
      slug: string;
      sponsorSlug: string;
      clientSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    projects: Array<{
      name: string;
      slug: string;
      caseSlug: string;
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    }>;
    totals: {
      threeMonthsAgo: number;
      twoMonthsAgo: number;
      oneMonthAgo: number;
      current: number;
    };
  };
}

export function getForecastData(data: any): ForecastData {
  const forecast = data.financial.revenueForecast;
  
  const mapConsultingItem = (item: any) => ({
    name: item.name,
    title: item.title,
    slug: item.slug,
    clientSlug: item.client?.slug,
    sponsorSlug: item.sponsor?.slug,
    caseSlug: item.case?.slug,
    sameDayThreeMonthsAgo: item.sameDayThreeMonthsAgo,
    normalizedSameDayThreeMonthsAgo: item.sameDayThreeMonthsAgo / forecast.workingDays.sameDayThreeMonthsAgo,
    threeMonthsAgo: item.threeMonthsAgo,
    normalizedThreeMonthsAgo: item.threeMonthsAgo / forecast.workingDays.threeMonthsAgo,
    sameDayTwoMonthsAgo: item.sameDayTwoMonthsAgo,
    normalizedSameDayTwoMonthsAgo: item.sameDayTwoMonthsAgo / forecast.workingDays.sameDayTwoMonthsAgo,
    twoMonthsAgo: item.twoMonthsAgo,
    normalizedTwoMonthsAgo: item.twoMonthsAgo / forecast.workingDays.twoMonthsAgo,
    sameDayOneMonthAgo: item.sameDayOneMonthAgo,
    normalizedSameDayOneMonthAgo: item.sameDayOneMonthAgo / forecast.workingDays.sameDayOneMonthAgo,
    oneMonthAgo: item.oneMonthAgo,
    normalizedOneMonthAgo: item.oneMonthAgo / forecast.workingDays.oneMonthAgo,
    realized: item.inAnalysis,
    normalizedRealized: item.inAnalysis / forecast.workingDays.inAnalysisPartial,
    projected: item.projected,
    normalizedProjected: item.projected / forecast.workingDays.inAnalysis,
    expected: item.expected,
    normalizedExpected: item.expected / forecast.workingDays.inAnalysis,
    expectedHistorical: item.expectedHistorical,
    normalizedExpectedHistorical: item.expectedHistorical / forecast.workingDays.inAnalysis,
    expectedOneMonthLater: item.expectedOneMonthLater,
    normalizedExpectedOneMonthLater: item.expectedOneMonthLater / forecast.workingDays.oneMonthLater,
    expectedTwoMonthsLater: item.expectedTwoMonthsLater,
    normalizedExpectedTwoMonthsLater: item.expectedTwoMonthsLater / forecast.workingDays.twoMonthsLater,
    expectedThreeMonthsLater: item.expectedThreeMonthsLater,
    normalizedExpectedThreeMonthsLater: item.expectedThreeMonthsLater / forecast.workingDays.threeMonthsLater,
    inAnalysisConsultingHours: item.inAnalysisConsultingHours || 0,
    normalizedInAnalysisConsultingHours: (item.inAnalysisConsultingHours || 0) / forecast.workingDays.inAnalysisPartial,
    sameDayThreeMonthsAgoConsultingHours: item.sameDayThreeMonthsAgoConsultingHours || 0,
    normalizedSameDayThreeMonthsAgoConsultingHours: (item.sameDayThreeMonthsAgoConsultingHours || 0) / forecast.workingDays.sameDayThreeMonthsAgo,
    threeMonthsAgoConsultingHours: item.threeMonthsAgoConsultingHours || 0,
    normalizedThreeMonthsAgoConsultingHours: (item.threeMonthsAgoConsultingHours || 0) / forecast.workingDays.threeMonthsAgo,
    sameDayTwoMonthsAgoConsultingHours: item.sameDayTwoMonthsAgoConsultingHours || 0,
    normalizedSameDayTwoMonthsAgoConsultingHours: (item.sameDayTwoMonthsAgoConsultingHours || 0) / forecast.workingDays.sameDayTwoMonthsAgo,
    twoMonthsAgoConsultingHours: item.twoMonthsAgoConsultingHours || 0,
    normalizedTwoMonthsAgoConsultingHours: (item.twoMonthsAgoConsultingHours || 0) / forecast.workingDays.twoMonthsAgo,
    sameDayOneMonthAgoConsultingHours: item.sameDayOneMonthAgoConsultingHours || 0,
    normalizedSameDayOneMonthAgoConsultingHours: (item.sameDayOneMonthAgoConsultingHours || 0) / forecast.workingDays.sameDayOneMonthAgo,
    oneMonthAgoConsultingHours: item.oneMonthAgoConsultingHours || 0,
    normalizedOneMonthAgoConsultingHours: (item.oneMonthAgoConsultingHours || 0) / forecast.workingDays.oneMonthAgo,
    consultingPreHours: item.consultingPreHours || 0,
    normalizedConsultingPreHours: (item.consultingPreHours || 0) / forecast.workingDays.inAnalysisPartial,
    threeMonthsAgoConsultingPreHours: item.threeMonthsAgoConsultingPreHours || 0,
    normalizedThreeMonthsAgoConsultingPreHours: (item.threeMonthsAgoConsultingPreHours || 0) / forecast.workingDays.threeMonthsAgo,
    twoMonthsAgoConsultingPreHours: item.twoMonthsAgoConsultingPreHours || 0,
    normalizedTwoMonthsAgoConsultingPreHours: (item.twoMonthsAgoConsultingPreHours || 0) / forecast.workingDays.twoMonthsAgo,
    oneMonthAgoConsultingPreHours: item.oneMonthAgoConsultingPreHours || 0,
    normalizedOneMonthAgoConsultingPreHours: (item.oneMonthAgoConsultingPreHours || 0) / forecast.workingDays.oneMonthAgo,
    startOfContract: item.startOfContract,
    endOfContract: item.endOfContract,
    weeklyApprovedHours: item.weeklyApprovedHours,
  });

  const calculateConsultingTotals = (items: ForecastItem[]) => {
    return items.reduce((acc: {
      expected: number;
      normalizedExpected: number;
      expectedHistorical: number;
      normalizedExpectedHistorical: number;
      expectedOneMonthLater: number;
      normalizedExpectedOneMonthLater: number;
      expectedTwoMonthsLater: number;
      normalizedExpectedTwoMonthsLater: number;
      expectedThreeMonthsLater: number;
      normalizedExpectedThreeMonthsLater: number;
    }, item) => ({
      expected: (acc.expected || 0) + (item.expected || 0),
      normalizedExpected: (acc.normalizedExpected || 0) + (item.normalizedExpected || 0),
      expectedHistorical: (acc.expectedHistorical || 0) + (item.expectedHistorical || 0),
      normalizedExpectedHistorical: (acc.normalizedExpectedHistorical || 0) + (item.normalizedExpectedHistorical || 0),
      expectedOneMonthLater: (acc.expectedOneMonthLater || 0) + (item.expectedOneMonthLater || 0),
      normalizedExpectedOneMonthLater: (acc.normalizedExpectedOneMonthLater || 0) + (item.normalizedExpectedOneMonthLater || 0),
      expectedTwoMonthsLater: (acc.expectedTwoMonthsLater || 0) + (item.expectedTwoMonthsLater || 0),
      normalizedExpectedTwoMonthsLater: (acc.normalizedExpectedTwoMonthsLater || 0) + (item.normalizedExpectedTwoMonthsLater || 0),
      expectedThreeMonthsLater: (acc.expectedThreeMonthsLater || 0) + (item.expectedThreeMonthsLater || 0),
      normalizedExpectedThreeMonthsLater: (acc.normalizedExpectedThreeMonthsLater || 0) + (item.normalizedExpectedThreeMonthsLater || 0),
    }), {
      expected: 0,
      normalizedExpected: 0,
      expectedHistorical: 0,
      normalizedExpectedHistorical: 0,
      expectedOneMonthLater: 0,
      normalizedExpectedOneMonthLater: 0,
      expectedTwoMonthsLater: 0,
      normalizedExpectedTwoMonthsLater: 0,
      expectedThreeMonthsLater: 0,
      normalizedExpectedThreeMonthsLater: 0
    });
  };

  const mapConsultingTotals = (totals: any, clients: ForecastItem[]) => {
    const calculatedTotals = calculateConsultingTotals(clients);
    return {
      ...mapConsultingItem(totals),
      ...calculatedTotals,
      sameDayThreeMonthsAgoConsultingFeeNew: totals.sameDayThreeMonthsAgoConsultingFeeNew || 0,
      threeMonthsAgoConsultingFeeNew: totals.threeMonthsAgoConsultingFeeNew || 0,
      sameDayTwoMonthsAgoConsultingFeeNew: totals.sameDayTwoMonthsAgoConsultingFeeNew || 0,
      twoMonthsAgoConsultingFeeNew: totals.twoMonthsAgoConsultingFeeNew || 0,
      sameDayOneMonthAgoConsultingFeeNew: totals.sameDayOneMonthAgoConsultingFeeNew || 0,
      oneMonthAgoConsultingFeeNew: totals.oneMonthAgoConsultingFeeNew || 0,
      realizedConsultingFeeNew: totals.inAnalysisConsultingFeeNew || 0,
      inAnalysisConsultingHours: totals.inAnalysisConsultingHours || 0,
      oneMonthAgoConsultingHours: totals.oneMonthAgoConsultingHours || 0,
      twoMonthsAgoConsultingHours: totals.twoMonthsAgoConsultingHours || 0,
      threeMonthsAgoConsultingHours: totals.threeMonthsAgoConsultingHours || 0,
      sameDayOneMonthAgoConsultingHours: totals.sameDayOneMonthAgoConsultingHours || 0,
      sameDayTwoMonthsAgoConsultingHours: totals.sameDayTwoMonthsAgoConsultingHours || 0,
      sameDayThreeMonthsAgoConsultingHours: totals.sameDayThreeMonthsAgoConsultingHours || 0,
      normalizedInAnalysisConsultingHours: (totals.inAnalysisConsultingHours || 0) / forecast.workingDays.inAnalysisPartial,
      normalizedOneMonthAgoConsultingHours: (totals.oneMonthAgoConsultingHours || 0) / forecast.workingDays.oneMonthAgo,
      normalizedTwoMonthsAgoConsultingHours: (totals.twoMonthsAgoConsultingHours || 0) / forecast.workingDays.twoMonthsAgo,
      normalizedThreeMonthsAgoConsultingHours: (totals.threeMonthsAgoConsultingHours || 0) / forecast.workingDays.threeMonthsAgo,
      normalizedSameDayOneMonthAgoConsultingHours: (totals.sameDayOneMonthAgoConsultingHours || 0) / forecast.workingDays.sameDayOneMonthAgo,
      normalizedSameDayTwoMonthsAgoConsultingHours: (totals.sameDayTwoMonthsAgoConsultingHours || 0) / forecast.workingDays.sameDayTwoMonthsAgo,
      normalizedSameDayThreeMonthsAgoConsultingHours: (totals.sameDayThreeMonthsAgoConsultingHours || 0) / forecast.workingDays.sameDayThreeMonthsAgo,
      inAnalysisConsultingPreHours: totals.inAnalysisConsultingPreHours || 0,
      normalizedInAnalysisConsultingPreHours: (totals.inAnalysisConsultingPreHours || 0) / forecast.workingDays.inAnalysisPartial,
      threeMonthsAgoConsultingPreHours: totals.threeMonthsAgoConsultingPreHours || 0,
      normalizedThreeMonthsAgoConsultingPreHours: (totals.threeMonthsAgoConsultingPreHours || 0) / forecast.workingDays.threeMonthsAgo,
      twoMonthsAgoConsultingPreHours: totals.twoMonthsAgoConsultingPreHours || 0,
      normalizedTwoMonthsAgoConsultingPreHours: (totals.twoMonthsAgoConsultingPreHours || 0) / forecast.workingDays.twoMonthsAgo,
      oneMonthAgoConsultingPreHours: totals.oneMonthAgoConsultingPreHours || 0,
      normalizedOneMonthAgoConsultingPreHours: (totals.oneMonthAgoConsultingPreHours || 0) / forecast.workingDays.oneMonthAgo,
    };
  };

  const mapOtherItem = (item: any) => ({
    name: item.name,
    title: item.title,
    slug: item.slug,
    clientSlug: item.client?.slug,
    sponsorSlug: item.sponsor?.slug,
    caseSlug: item.case?.slug,
    threeMonthsAgo: item.threeMonthsAgo,
    twoMonthsAgo: item.twoMonthsAgo,
    oneMonthAgo: item.oneMonthAgo,
    current: item.inAnalysis,
    threeMonthsAgoConsultingPreHours: item.threeMonthsAgoConsultingPreHours || 0,
    twoMonthsAgoConsultingPreHours: item.twoMonthsAgoConsultingPreHours || 0,
    oneMonthAgoConsultingPreHours: item.oneMonthAgoConsultingPreHours || 0,
    inAnalysisConsultingPreHours: item.inAnalysisConsultingPreHours || 0,
    endOfContract: item.endOfContract,
    weeklyApprovedHours: item.weeklyApprovedHours,
  });

  const consultingClients = forecast.byKind.consulting.byClient.data.map(mapConsultingItem);

  return {
    daily: forecast.daily.data,

    consulting: {
      clients: consultingClients,
      sponsors: forecast.byKind.consulting.bySponsor.data.map(mapConsultingItem),
      cases: forecast.byKind.consulting.byCase.data.map(mapConsultingItem),
      projects: forecast.byKind.consulting.byProject.data.map(mapConsultingItem),
      consultants: forecast.byKind.consulting.byConsultant.data.map(mapConsultingItem),
      totals: mapConsultingTotals(forecast.byKind.consulting.totals, consultingClients),
    },
    consultingPre: {
      clients: forecast.byKind.consultingPre.byClient.data.map(mapOtherItem),
      sponsors: forecast.byKind.consultingPre.bySponsor.data.map(mapOtherItem),
      cases: forecast.byKind.consultingPre.byCase.data.map(mapOtherItem),
      projects: forecast.byKind.consultingPre.byProject.data.map(mapOtherItem),
      totals: {
        threeMonthsAgo: forecast.byKind.consultingPre.totals.threeMonthsAgo,
        twoMonthsAgo: forecast.byKind.consultingPre.totals.twoMonthsAgo,
        oneMonthAgo: forecast.byKind.consultingPre.totals.oneMonthAgo,
        current: forecast.byKind.consultingPre.totals.inAnalysis,
        threeMonthsAgoConsultingPreHours: forecast.byKind.consultingPre.totals.threeMonthsAgoConsultingPreHours,
        twoMonthsAgoConsultingPreHours: forecast.byKind.consultingPre.totals.twoMonthsAgoConsultingPreHours,
        oneMonthAgoConsultingPreHours: forecast.byKind.consultingPre.totals.oneMonthAgoConsultingPreHours,
        inAnalysisConsultingPreHours: forecast.byKind.consultingPre.totals.inAnalysisConsultingPreHours,
      },
    },
    handsOn: {
      clients: forecast.byKind.handsOn.byClient.data.map(mapOtherItem),
      sponsors: forecast.byKind.handsOn.bySponsor.data.map(mapOtherItem),
      cases: forecast.byKind.handsOn.byCase.data.map(mapOtherItem),
      projects: forecast.byKind.handsOn.byProject.data.map(mapOtherItem),
      totals: {
        threeMonthsAgo: forecast.byKind.handsOn.totals.threeMonthsAgo,
        twoMonthsAgo: forecast.byKind.handsOn.totals.twoMonthsAgo,
        oneMonthAgo: forecast.byKind.handsOn.totals.oneMonthAgo,
        current: forecast.byKind.handsOn.totals.inAnalysis,
      },
    },
    squad: {
      clients: forecast.byKind.squad.byClient.data.map(mapOtherItem),
      sponsors: forecast.byKind.squad.bySponsor.data.map(mapOtherItem),
      cases: forecast.byKind.squad.byCase.data.map(mapOtherItem),
      projects: forecast.byKind.squad.byProject.data.map(mapOtherItem),
      totals: {
        threeMonthsAgo: forecast.byKind.squad.totals.threeMonthsAgo,
        twoMonthsAgo: forecast.byKind.squad.totals.twoMonthsAgo,
        oneMonthAgo: forecast.byKind.squad.totals.oneMonthAgo,
        current: forecast.byKind.squad.totals.inAnalysis,
      },
    },
  };
}

// Função auxiliar para validar os dados
export function validateForecastData(data: any): boolean {
  if (!data?.financial?.revenueForecast?.byKind) {
    console.error('Dados de previsão inválidos: estrutura principal ausente');
    return false;
  }

  const forecast = data.financial.revenueForecast;
  const requiredSections = ['consulting', 'consultingPre', 'handsOn', 'squad'];
  const requiredSubsections = ['byClient', 'bySponsor', 'byCase', 'byProject', 'totals'];

  for (const section of requiredSections) {
    if (!forecast.byKind[section]) {
      console.error(`Dados de previsão inválidos: seção ${section} ausente`);
      return false;
    }

    for (const subsection of requiredSubsections) {
      if (!forecast.byKind[section][subsection]) {
        console.error(`Dados de previsão inválidos: subseção ${subsection} ausente em ${section}`);
        return false;
      }
    }
  }

  if (!forecast.workingDays) {
    console.error('Dados de previsão inválidos: dias úteis ausentes');
    return false;
  }

  return true;
}

// Função para tratar erros de dados ausentes
export function getDefaultForecastItem(): ForecastItem {
  return {
    slug: '',
    sameDayThreeMonthsAgo: 0,
    normalizedSameDayThreeMonthsAgo: 0,
    threeMonthsAgo: 0,
    normalizedThreeMonthsAgo: 0,
    sameDayTwoMonthsAgo: 0,
    normalizedSameDayTwoMonthsAgo: 0,
    twoMonthsAgo: 0,
    normalizedTwoMonthsAgo: 0,
    sameDayOneMonthAgo: 0,
    normalizedSameDayOneMonthAgo: 0,
    oneMonthAgo: 0,
    normalizedOneMonthAgo: 0,
    realized: 0,
    normalizedRealized: 0,
    projected: 0,
    normalizedProjected: 0,
    expected: 0,
    normalizedExpected: 0,
    expectedHistorical: 0,
    normalizedExpectedHistorical: 0,
    expectedOneMonthLater: 0,
    normalizedExpectedOneMonthLater: 0,
    expectedTwoMonthsLater: 0,
    normalizedExpectedTwoMonthsLater: 0,
    expectedThreeMonthsLater: 0,
    normalizedExpectedThreeMonthsLater: 0,
  };
}

// Função para tratar erros de dados ausentes em outros tipos
export function getDefaultOtherItem() {
  return {
    name: '',
    slug: '',
    threeMonthsAgo: 0,
    twoMonthsAgo: 0,
    oneMonthAgo: 0,
    current: 0,
    threeMonthsAgoConsultingPreHours: 0,
    twoMonthsAgoConsultingPreHours: 0,
    oneMonthAgoConsultingPreHours: 0,
    inAnalysisConsultingPreHours: 0,
    endOfContract: undefined,
    weeklyApprovedHours: undefined,
  };
}

// Função para processar os dados com segurança
export function processForecastData(data: any): ForecastData {
  try {
    if (!validateForecastData(data)) {
      throw new Error('Dados de previsão inválidos');
    }
    return getForecastData(data);
  } catch (error) {
    console.error('Erro ao processar dados de previsão:', error);
    // Retorna uma estrutura de dados vazia mas válida
    return {
      daily: [],
      consulting: {
        clients: [],
        sponsors: [],
        cases: [],
        projects: [],
        consultants: [],
        totals: getDefaultForecastItem(),
      },
      consultingPre: {
        clients: [],
        sponsors: [],
        cases: [],
        projects: [],
        totals: getDefaultOtherItem(),
      },
      handsOn: {
        clients: [],
        sponsors: [],
        cases: [],
        projects: [],
        totals: getDefaultOtherItem(),
      },
      squad: {
        clients: [],
        sponsors: [],
        cases: [],
        projects: [],
        totals: getDefaultOtherItem(),
      },
    };
  }
} 

