import { gql } from "@apollo/client";

export const PERFORMANCE_ANALYSIS_QUERY = gql`
  fragment TotalsFragment on Totals {
    preContracted {
      approvedWorkHours
      actualWorkHours
      inContextActualWorkHours
      possibleUnpaidHours
      possibleIdleHours
    }
    regular {
      approvedWorkHours
      actualWorkHours
      inContextActualWorkHours
      wastedHours
      overApprovedHours
    }
  }

  fragment RegularCaseFragment on OneWeekRegularCasePerformanceSummary {
    title
    actualWorkHours
    approvedWorkHours
    inContextActualWorkHours
    overApprovedHours
    wastedHours
  }

  fragment PreContractedCaseFragment on OneWeekPreContractedCasePerformanceSummary {
    title
    actualWorkHours
    approvedWorkHours
    inContextActualWorkHours
    possibleIdleHours
    possibleUnpaidHours
  }

  query PerformanceAnalysis($date: Date!) {
    performanceAnalysis(date_of_interest: $date) {
      dateOfInterest
      start
      end
      weeks {
        start
        end
        periodType
        accountManagers {
          name
          totals {
            ...TotalsFragment
          }
          clients {
            name
            totals {
              ...TotalsFragment
            }
            sponsors {
              name
              totals {
                ...TotalsFragment
              }
              regularCases {
                ...RegularCaseFragment
              }
              preContractedCases {
                ...PreContractedCaseFragment
              }
            }
          }
        }
        clients {
          name
          totals {
            ...TotalsFragment
          }
          sponsors {
            name
            totals {
              ...TotalsFragment
            }
            regularCases {
              ...RegularCaseFragment
            }
            preContractedCases {
              ...PreContractedCaseFragment
            }
          }
        }
      }
    }
  }
`;
