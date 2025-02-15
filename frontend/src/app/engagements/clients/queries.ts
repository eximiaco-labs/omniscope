import { gql } from "@apollo/client";

export const GET_CLIENTS = gql`
  query GetClients {
    engagements {
      clients {
        data {
          slug
          name
          logoUrl
          isStrategic
          activeCases {
            data {
              title
              startOfContract
              endOfContract
              weeklyApprovedHours
              preContractedValue
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
      }
    }
    timesheet(slug: "last-six-weeks") {
      summary {
        uniqueClients
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
    }
  }
`;
