import { gql } from "@apollo/client";

export const GET_CASES_AND_TIMESHEET = gql`
  query GetCasesAndTimesheet($filters: [FilterInput]) {
    cases(onlyActives: true) {
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
      isStale
    }
    timesheet(slug: "last-six-weeks", kind: ALL, filters: $filters) {
      uniqueClients
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
      byCase {
        title
        totalHours
        totalConsultingHours
        totalHandsOnHours
        totalSquadHours
        totalInternalHours

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


