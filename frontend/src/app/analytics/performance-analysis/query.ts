import { gql } from "@apollo/client";

export const PERFORMANCE_ANALYSIS_QUERY = gql`
  fragment TotalsRegularFragment on TotalsRegular {
    approvedWorkHours
    actualWorkHours
    inContextActualWorkHours
    wastedHours
    overApprovedHours
  }

  fragment TotalsPreContractedFragment on TotalsPreContracted {
    approvedWorkHours
    actualWorkHours
    inContextActualWorkHours
    possibleIdleHours
    possibleUnpaidHours
  }

  fragment WeeksRegularFragment on PerformanceAnalysisPivotedRegularWeek {
    start
    end
    totals {
      ...TotalsRegularFragment
    }
  }

  fragment WeeksPreContractedFragment on PerformanceAnalysisPivotedPreContractedWeek {
    start
    end
    totals {
      ...TotalsPreContractedFragment
    }
  }

  query PerformanceAnalysis($date: Date!) {
    performanceAnalysis(dateOfInterest: $date) {
      pivoted {
        preContracted {
          byAccountManager {
            name
            past {
              ...TotalsPreContractedFragment
            }
            weeks {
              ...WeeksPreContractedFragment
            }
            byClient {
              name
              past {
                ...TotalsPreContractedFragment
              }
              weeks {
                ...WeeksPreContractedFragment
              }
              bySponsor {
                name
                past {
                  ...TotalsPreContractedFragment
                }
                weeks {
                  ...WeeksPreContractedFragment
                }
                byCase {
                  title
                  past {
                    ...TotalsPreContractedFragment
                  }
                  weeks {
                    ...WeeksPreContractedFragment
                  }
                }
              }
            }
          }
        }
        regular {
          byAccountManager {
            name
            past {
              ...TotalsRegularFragment
            }
            weeks {
              ...WeeksRegularFragment
            }
            byClient {
              name
              past {
                ...TotalsRegularFragment
              }
              weeks {
                ...WeeksRegularFragment
              }
              bySponsor {
                name
                past {
                  ...TotalsRegularFragment
                }
                weeks {
                  ...WeeksRegularFragment
                }
                byCase {
                  title
                  past {
                    ...TotalsRegularFragment
                  }
                  weeks {
                    ...WeeksRegularFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
