export interface RevenueTrackingQuery {
  revenueTracking: {
    year: number;
    month: number;
    summaries: {
      byMode: {
        regular: number;
        preContracted: number;
        total: number;
      };
      byKind: Array<{
        name: string;
        regular: number;
        preContracted: number;
        total: number;
      }>;
      byAccountManager: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
      byClient: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
      bySponsor: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
    };
  };
}