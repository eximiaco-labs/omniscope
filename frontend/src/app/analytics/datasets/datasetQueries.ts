import { gql } from "@apollo/client";

export const GET_DATASETS = gql`
  query GetDatasets {
    datasets {
      slug
      kind
      name
    }
  }
`;

export const GET_TIMESHEET = gql`
  query GetTimesheet($slug: String!, $filters: [FilterInput]) {
    timesheet(slug: $slug, filters: $filters) {
      totalHours
      totalConsultingHours
      totalSquadHours
      totalInternalHours
      totalHandsOnHours

      byKind {
        consulting {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
          uniqueAccountManagers
        }

        squad {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
          uniqueAccountManagers
        }

        handsOn {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
          uniqueAccountManagers
        }

        internal {
          uniqueClients
          uniqueWorkers
          uniqueWorkingDays
          uniqueSponsors
          uniqueAccountManagers
        }
      }

      uniqueClients

      byClient {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }

      uniqueWorkers

      byWorker {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }

      bySponsor {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueSponsors

      byAccountManager {
        name
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueAccountManagers

      byDate {
        date
        totalHours
        totalConsultingHours
        totalSquadHours
        totalInternalHours
        totalHandsOnHours
      }
      uniqueWorkingDays

      filterableFields {
        field
        selectedValues
        options
      }
    }
  }
`;

export const GET_ONTOLOGY = gql`
  query GetOntology($slug: String!, $filters: [FilterInput]) {
    ontology(slug: $slug, filters: $filters) {
      totalEntries
      uniqueClasses
      uniqueAuthors
      byAuthor {
        name
        totalEntries
        uniqueClasses
      }
      byClass {
        name
        totalEntries
        uniqueAuthors
      }
      filterableFields {
        field
        selectedValues
        options
      }
    }
  }
`;
