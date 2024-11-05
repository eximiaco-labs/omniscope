import { gql } from "@apollo/client";

export const GET_CLIENT_BY_SLUG = gql`
  query GetClientBySlug($slug: String!) {
    client(slug: $slug) {
      name
      logoUrl
      isStrategic
    }
  }
`;

export const GET_CLIENT_TIMESHEET = gql`
  query GetClientTimesheet($clientName: String!, $datasetSlug: String!) {
    cases(onlyActives: true) {
      id
      slug
      title
      isActive
      preContractedValue
      hasDescription
      everhourProjectsIds
      startOfContract
      endOfContract
      weeklyApprovedHours
      client {
        name
      }
      lastUpdate {
        date
        author
        status
        observations
      }
      tracker {
        id
        name
      }
    }
    timesheet(slug: $datasetSlug, filters: [{ field: "ClientName", selectedValues: [$clientName] }]) {
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
        workers
        caseDetails {
          id
          slug
          title
          isActive
          preContractedValue
          sponsor
          hasDescription
          everhourProjectsIds
          startOfContract
          endOfContract
          weeklyApprovedHours
          client {
            name
          }
          lastUpdate {
            date
            author
            status
            observations
          }
          tracker {
            id
            name
          }
        }
        byWeek {
          week
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
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
