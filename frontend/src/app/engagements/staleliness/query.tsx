import { gql } from "@apollo/client";

export const STALELINESS_QUERY = gql`
  query StalelinessQuery {
    engagements {
      summaries {
        staleliness {
          staleCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
            }
          }
          staleInOneWeekCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
            }
          }
          staleInLessThan15DaysCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
            }
          }
          noDescriptionCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
            }
          }
          upToDateCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
            }
          }
        }
      }
    }
  }
`;
