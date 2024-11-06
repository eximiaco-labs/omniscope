import { gql } from "@apollo/client";

export const GET_SPONSOR_BY_SLUG = gql`
  query GetSponsorBySlug($slug: String!) {
    sponsor(slug: $slug) {
      name
      photoUrl
      jobTitle
      linkedinUrl
      client {
        id
        name
      }
    }
  }
`;

export const GET_SPONSOR_TIMESHEET = gql`
  query GetSponsorTimesheet($sponsorName: String!, $datasetSlug: String!) {
    timesheet(slug: $datasetSlug, filters: [{ field: "Sponsor", selectedValues: [$sponsorName] }]) {
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
          startOfContract
          endOfContract
          weeklyApprovedHours
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
        workersByTrackingProject {
          projectId
          workers
        }
      }
    }
  }
`; 