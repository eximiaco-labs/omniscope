import { gql } from "@apollo/client";

export const GET_CLIENTS = gql`
  query GetClients {
    clients {
      slug
      name
      logoUrl
      isStrategic
    }
      
    cases(onlyActives: true) {
      startOfContract
      endOfContract
      weeklyApprovedHours
      preContractedValue
      client {
        name
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
      byClient {
        name
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
    }
  }
`;
