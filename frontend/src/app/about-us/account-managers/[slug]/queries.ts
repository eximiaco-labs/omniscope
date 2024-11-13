import { gql } from "@apollo/client";

export const GET_ACCOUNT_MANAGER = gql`
  query GetAccountManager($slug: String!, $dataset: String!) {
    accountManager(slug: $slug) {
      photoUrl
      name
      position
  
      activeDeals {
        title
        clientOrProspectName
        client {
          id
        }
        stageName
        stageOrderNr
        daysSinceLastUpdate
      }
  
      cases(onlyActives: true) {
        title
        startOfContract
        endOfContract
        lastUpdated
        hasDescription
        lastUpdate {
          status
          date
          author
          observations
        }
        client { name }
        isStale
      }
      timesheet(slug: $dataset) {
        byKind {
          consulting {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          handsOn {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          squad {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          internal {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }

        byCase {
          title
          caseDetails {
            client {
              name
              accountManager {
                name
              }
            }
            sponsor
          }
          byWorker {
            name
            totalConsultingHours
            totalHandsOnHours
            totalSquadHours
            totalInternalHours
          }
        }
      }
    }
  }
`;

export interface AccountManager {
  photoUrl: string;
  name: string;
  position: string;

  activeDeals: Array<{
    title: string;
    clientOrProspectName: string;
    client: { id: number };
    stageName: string;
    stageOrderNr: number;
    daysSinceLastUpdate: number;
  }>;

  cases: Array<{
    title: string;
    startOfContract: string;
    endOfContract: string;
    lastUpdated: string;
    hasDescription: boolean;
    lastUpdate: {
      status: string;
      date: Date;
      author: string;
      observations: string;
    };
    client: { name: string; accountManager: { name: string } };
    isStale: boolean;
  }>;

  timesheet: {
    byKind: {
      consulting: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      handsOn: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      squad: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      internal: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
    };
    byCase: Array<{
      title: string;
      caseDetails: {
        client: { name: string, accountManager: { name: string } };
        sponsor: string;
      };
      byWorker: Array<{
        name: string;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      }>;
    }>;
  };
}
