import { gql } from '@apollo/client';
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
          }
        }
        accountManagers {
          name
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
            }
          }
          clients {
            name
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
              }
            }
            sponsors {
              name
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
                }
              }
              regularCases {
                title
                approvedWorkHours
                actualWorkHours
                inContextActualWorkHours
                wastedHours
              }
              preContractedCases {
                title
                approvedWorkHours
                actualWorkHours
                inContextActualWorkHours
                possibleIdleHours
                possibleUnpaidHours
              }
            }
          }
        }
      }
    }
  }
`;