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
}

interface ForecastSection {
  clients: ForecastItem[];
  sponsors: ForecastItem[];
  cases: ForecastItem[];
  projects: ForecastItem[];
  consultants: ForecastItem[];
  totals: ForecastTotals;
}

interface ForecastData {
  consulting: ForecastSection;
  consultingPre: {
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
  const mapConsultingItem = (item: any) => ({
    name: item.name,
    title: item.title,
    slug: item.slug,
    clientSlug: item.clientSlug,
    sponsorSlug: item.sponsorSlug,
    caseSlug: item.caseSlug,
    sameDayThreeMonthsAgo: item.sameDayThreeMonthsAgo,
    normalizedSameDayThreeMonthsAgo: item.sameDayThreeMonthsAgo / data.forecast.workingDays.sameDayThreeMonthsAgo,
    threeMonthsAgo: item.threeMonthsAgo,
    normalizedThreeMonthsAgo: item.threeMonthsAgo / data.forecast.workingDays.threeMonthsAgo,
    sameDayTwoMonthsAgo: item.sameDayTwoMonthsAgo,
    normalizedSameDayTwoMonthsAgo: item.sameDayTwoMonthsAgo / data.forecast.workingDays.sameDayTwoMonthsAgo,
    twoMonthsAgo: item.twoMonthsAgo,
    normalizedTwoMonthsAgo: item.twoMonthsAgo / data.forecast.workingDays.twoMonthsAgo,
    sameDayOneMonthAgo: item.sameDayOneMonthAgo,
    normalizedSameDayOneMonthAgo: item.sameDayOneMonthAgo / data.forecast.workingDays.sameDayOneMonthAgo,
    oneMonthAgo: item.oneMonthAgo,
    normalizedOneMonthAgo: item.oneMonthAgo / data.forecast.workingDays.oneMonthAgo,
    realized: item.inAnalysis,
    normalizedRealized: item.inAnalysis / data.forecast.workingDays.inAnalysisPartial,
    projected: item.projected,
    normalizedProjected: item.projected / data.forecast.workingDays.inAnalysis,
    expected: item.expected,
    normalizedExpected: item.expected / data.forecast.workingDays.inAnalysis,
    expectedHistorical: item.expectedHistorical,
    normalizedExpectedHistorical: item.expectedHistorical / data.forecast.workingDays.inAnalysis,
    expectedOneMonthLater: item.expectedOneMonthLater,
    normalizedExpectedOneMonthLater: item.expectedOneMonthLater / data.forecast.workingDays.oneMonthLater,
    expectedTwoMonthsLater: item.expectedTwoMonthsLater,
    normalizedExpectedTwoMonthsLater: item.expectedTwoMonthsLater / data.forecast.workingDays.twoMonthsLater,
    expectedThreeMonthsLater: item.expectedThreeMonthsLater,
    normalizedExpectedThreeMonthsLater: item.expectedThreeMonthsLater / data.forecast.workingDays.threeMonthsLater,
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
      normalizedInAnalysisConsultingHours: (totals.inAnalysisConsultingHours || 0) / data.forecast.workingDays.inAnalysisPartial,
      normalizedOneMonthAgoConsultingHours: (totals.oneMonthAgoConsultingHours || 0) / data.forecast.workingDays.oneMonthAgo,
      normalizedTwoMonthsAgoConsultingHours: (totals.twoMonthsAgoConsultingHours || 0) / data.forecast.workingDays.twoMonthsAgo,
      normalizedThreeMonthsAgoConsultingHours: (totals.threeMonthsAgoConsultingHours || 0) / data.forecast.workingDays.threeMonthsAgo,
      normalizedSameDayOneMonthAgoConsultingHours: (totals.sameDayOneMonthAgoConsultingHours || 0) / data.forecast.workingDays.sameDayOneMonthAgo,
      normalizedSameDayTwoMonthsAgoConsultingHours: (totals.sameDayTwoMonthsAgoConsultingHours || 0) / data.forecast.workingDays.sameDayTwoMonthsAgo,
      normalizedSameDayThreeMonthsAgoConsultingHours: (totals.sameDayThreeMonthsAgoConsultingHours || 0) / data.forecast.workingDays.sameDayThreeMonthsAgo,
    };
  };

  const mapOtherItem = (item: any) => ({
    name: item.name,
    title: item.title,
    slug: item.slug,
    clientSlug: item.clientSlug,
    sponsorSlug: item.sponsorSlug,
    caseSlug: item.caseSlug,
    threeMonthsAgo: item.threeMonthsAgo,
    twoMonthsAgo: item.twoMonthsAgo,
    oneMonthAgo: item.oneMonthAgo,
    current: item.inAnalysis,
  });

  const consultingClients = data.forecast.byKind.consulting.byClient.map(mapConsultingItem);

  return {
    consulting: {
      clients: consultingClients,
      sponsors: data.forecast.byKind.consulting.bySponsor.map(mapConsultingItem),
      cases: data.forecast.byKind.consulting.byCase.map(mapConsultingItem),
      projects: data.forecast.byKind.consulting.byProject.map(mapConsultingItem),
      consultants: data.forecast.byKind.consulting.byConsultant.map(mapConsultingItem),
      totals: mapConsultingTotals(data.forecast.byKind.consulting.totals, consultingClients),
    },
    consultingPre: {
      clients: data.forecast.byKind.consultingPre.byClient.map(mapOtherItem),
      sponsors: data.forecast.byKind.consultingPre.bySponsor.map(mapOtherItem),
      cases: data.forecast.byKind.consultingPre.byCase.map(mapOtherItem),
      projects: data.forecast.byKind.consultingPre.byProject.map(mapOtherItem),
      totals: {
        threeMonthsAgo: data.forecast.byKind.consultingPre.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.consultingPre.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.consultingPre.totals.oneMonthAgo,
        current: data.forecast.byKind.consultingPre.totals.inAnalysis,
      },
    },
    handsOn: {
      clients: data.forecast.byKind.handsOn.byClient.map(mapOtherItem),
      sponsors: data.forecast.byKind.handsOn.bySponsor.map(mapOtherItem),
      cases: data.forecast.byKind.handsOn.byCase.map(mapOtherItem),
      projects: data.forecast.byKind.handsOn.byProject.map(mapOtherItem),
      totals: {
        threeMonthsAgo: data.forecast.byKind.handsOn.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.handsOn.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.handsOn.totals.oneMonthAgo,
        current: data.forecast.byKind.handsOn.totals.inAnalysis,
      },
    },
    squad: {
      clients: data.forecast.byKind.squad.byClient.map(mapOtherItem),
      sponsors: data.forecast.byKind.squad.bySponsor.map(mapOtherItem),
      cases: data.forecast.byKind.squad.byCase.map(mapOtherItem),
      projects: data.forecast.byKind.squad.byProject.map(mapOtherItem),
      totals: {
        threeMonthsAgo: data.forecast.byKind.squad.totals.threeMonthsAgo,
        twoMonthsAgo: data.forecast.byKind.squad.totals.twoMonthsAgo,
        oneMonthAgo: data.forecast.byKind.squad.totals.oneMonthAgo,
        current: data.forecast.byKind.squad.totals.inAnalysis,
      },
    },
  };
}

// Função auxiliar para validar os dados
export function validateForecastData(data: any): boolean {
  if (!data?.forecast?.byKind) {
    console.error('Dados de previsão inválidos: estrutura principal ausente');
    return false;
  }

  const requiredSections = ['consulting', 'consultingPre', 'handsOn', 'squad'];
  const requiredSubsections = ['byClient', 'bySponsor', 'byCase', 'byProject', 'totals'];

  for (const section of requiredSections) {
    if (!data.forecast.byKind[section]) {
      console.error(`Dados de previsão inválidos: seção ${section} ausente`);
      return false;
    }

    for (const subsection of requiredSubsections) {
      if (!data.forecast.byKind[section][subsection]) {
        console.error(`Dados de previsão inválidos: subseção ${subsection} ausente em ${section}`);
        return false;
      }
    }
  }

  if (!data.forecast.workingDays) {
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