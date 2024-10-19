import { gql } from "@apollo/client";

export const GET_CASES_AND_TIMESHEET = gql`
  query GetCasesAndTimesheet {
    cases(onlyActives: true) {
      id
      slug
      title
      isActive
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
    }
    timesheet(slug: "last-six-weeks", kind: ALL) {
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
      }
    }
  }
`;
