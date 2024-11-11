import { gql } from "@apollo/client";
export const PERFORMANCE_ANALYSIS_QUERY = gql`
  query PerformanceAnalysis($date: Date!) {
    performanceAnalysis(date_of_interest: $date) {
      dateOfInterest
      start
      end
      weeks {
        start
        end
        totals {
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

        regularCases {
          title
          client
          accountManager
          sponsor
          approvedWorkHours
          actualWorkHours
          inContextActualWorkHours
          wastedHours
          overApprovedHours
        }

        preContractedCases {
          title
          client
          accountManager
          sponsor
          approvedWorkHours
          actualWorkHours
          inContextActualWorkHours
          possibleIdleHours
          possibleUnpaidHours
        }
      }
    }
  }
`;
