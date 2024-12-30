import { gql } from "@apollo/client";

export const STALELINESS_QUERY = gql`
  query StalelinessQuery {
    staleliness {
      staleCases {
        title
        slug
        lastUpdated
        daysSinceUpdate
        workers {
          name
          slug
        }
      }
      staleInOneWeekCases {
        title
        slug
        lastUpdated
        daysSinceUpdate
        workers {
          name
          slug
        }
      }
      staleInLessThan15DaysCases {
        title
        slug
        lastUpdated
        daysSinceUpdate
        workers {
          name
          slug
        }
      }
      noDescriptionCases {
        title
        slug
        lastUpdated
        daysSinceUpdate
        workers {
          name
          slug
        }
      }
      upToDateCases {
        title
        slug
        lastUpdated
        daysSinceUpdate
        workers {
          name
          slug
        }
      }
    }
  }
`;
