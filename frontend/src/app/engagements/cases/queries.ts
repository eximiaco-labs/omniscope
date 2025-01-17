import { gql } from "@apollo/client";

export const GET_CASES_AND_TIMESHEET = gql`
  query GetCases($filters: [DatasetFilterInput]) {
    engagements {
      cases(filter: {field: "isActive", value: {is: true}}) {
        data {
          id
          slug
          title
          isActive
          preContractedValue
          sponsor {
            name
          }
          hasDescription
          startOfContract
          endOfContract
          weeklyApprovedHours
          client {
            name
          }
          isStale
          updates {
            data {
              date
              status
              author
            }
          }
          timesheet(slug: "last-six-weeks") {
            summary {
              totalHours
              totalConsultingHours
              totalHandsOnHours
              totalSquadHours
              totalInternalHours
            }
            byWeek {
              data {
                week
                totalConsultingHours
                totalHandsOnHours
                totalSquadHours
                totalInternalHours
              }
            }
          }
        }
        metadata {
          filtered
          total
        }
      }
    }
    timesheet(slug: "last-six-weeks", filters: $filters) {
      summary {
        uniqueCases
      }
      byKind {
        consulting {
          uniqueClients
        }
        handsOn {
          uniqueClients
        }
        squad {
          uniqueClients
        }
        internal {
          uniqueClients
        }
      }
      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`;


