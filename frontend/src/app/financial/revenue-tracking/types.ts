export interface RevenueTrackingQuery {
  financial: {
    revenueTracking: {
      year: number;
      month: number;
      summaries: {
        byMode: {
          regular: number;
          preContracted: number;
          total: number;
        };
        byKind: {
          data: Array<{
            name: string;
            regular: number;
            preContracted: number;
            total: number;
          }>;
        };
        byAccountManager: {
          data: Array<{
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
        byClient: {
          data: Array<{
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
        bySponsor: {
          data: Array<{
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
      regular: {
        monthly: {
          byAccountManager: {
            data: Array<{
              name: string;
              slug: string;
              fee: number;
              byClient: {
                data: Array<{
                  name: string;
                  slug: string;
                  fee: number;
                  bySponsor: {
                    data: Array<{
                      name: string;
                      slug: string;
                      fee: number;
                      byCase: {
                        data: Array<{
                          title: string;
                          slug: string;
                          fee: number;
                          byProject: {
                            data: Array<{
                              kind: string;
                              name: string;
                              fee: number;
                              rate: number;
                              hours: number;
                            }>;
                          };
                        }>;
                      };
                    }>;
                  };
                }>;
              };
            }>;
          };
          total: number;
        };
      };
      preContracted: {
        monthly: {
          total: number;
          byAccountManager: {
            data: Array<{
              name: string;
              slug: string;
              fee: number;
              byClient: {
                data: Array<{
                  name: string;
                  slug: string;
                  fee: number;
                  bySponsor: {
                    data: Array<{
                      name: string;
                      slug: string;
                      fee: number;
                      byCase: {
                        data: Array<{
                          title: string;
                          slug: string;
                          fee: number;
                          byProject: {
                            data: Array<{
                              kind: string;
                              name: string;
                              fee: number;
                            }>;
                          };
                        }>;
                      };
                    }>;
                  };
                }>;
              };
            }>;
          };
        };
      };
      filterableFields: Array<{
        field: string;
        options: string[];
        selectedValues: string[];
      }>;
    };
  };
}