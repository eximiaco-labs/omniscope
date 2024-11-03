import { gql } from '@apollo/client';

export const PERFORMANCE_ANALYSIS_QUERY = gql`
  query PerformanceAnalysis($date: Date!) {
    performanceAnalysis(date_of_interest: $date) {
      start
      end
      dateOfInterest
      weeks {
        start
        end
        totalApprovedWorkHours
        totalPreContractedApprovedWorkHours
        totalRegularApprovedWorkHours
        totalActualWorkHours
        totalPreContractedActualWorkHours
        totalRegularActualWorkHours
        totalPossibleUnpaidHours
        totalPossibleIdleHours
        totalPossibleWastedHours

        cases {
          id
          title
          sponsor
          client
          accountManager
          approvedWorkHours
          actualWorkHours
          isPreContracted
          possibleUnpaidHours
          possibleIdleHours
          wastedHours
        }
        clients {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalRegularApprovedWorkHours
          totalPreContractedActualWorkHours
          totalRegularActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        sponsors {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalRegularApprovedWorkHours
          totalPreContractedActualWorkHours
          totalRegularActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        accountManagers {
          name
          accountManager
          totalApprovedWorkHours
          totalActualWorkHours
          totalPreContractedApprovedWorkHours
          totalRegularApprovedWorkHours
          totalPreContractedActualWorkHours
          totalRegularActualWorkHours
          totalWastedHours
          totalPossibleUnpaidHours
          totalPossibleIdleHours
        }
        actualWorkHours {
          date
          hours
          preContractedWorkHours
          regularWorkHours
          byCase {
            caseId
            hours
            preContracted
          }
        }
      }
    }
  }
`; 