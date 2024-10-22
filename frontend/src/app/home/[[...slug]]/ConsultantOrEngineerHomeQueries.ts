import { gql } from "@apollo/client";

export const GET_CLIENT_STATS = gql`
  query GetData($filters: [FilterInput]) {
    timesheet(slug: "last-six-weeks", kind: ALL, filters: $filters) {
      uniqueClients
      uniqueCases
      uniqueWorkers
      totalHours

      byKind {
        consulting {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        handsOn {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        squad {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        internal {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
      }

      byClient {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }

      bySponsor {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }

      byWorker {
        name
        uniqueClients
        uniqueCases
        totalHours
        byKind {
          consulting {
            uniqueClients
            uniqueCases
            totalHours
          }
          handsOn {
            uniqueClients
            uniqueCases
            totalHours
          }
          squad {
            uniqueClients
            uniqueCases
            totalHours
          }
          internal {
            uniqueClients
            uniqueCases
            totalHours
          }
        }
      }

      byCase {
        title
        totalHours
        totalConsultingHours
        totalHandsOnHours
        totalSquadHours
        totalInternalHours
        caseDetails {
          startOfContract
          endOfContract
          weeklyApprovedHours
          client {
            name
          }
          lastUpdate {
            date
            status
          }
        }
      }
    }
  }
`;
