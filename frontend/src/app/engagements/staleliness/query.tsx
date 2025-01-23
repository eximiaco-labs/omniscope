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
              consultantsOrEngineers { 
                data {
                  name
                  slug
                }
              }
            }
          }
          staleInOneWeekCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
              consultantsOrEngineers { 
                data {
                  name
                  slug
                }
              }
            }
          }
          staleInLessThan15DaysCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
              consultantsOrEngineers { 
                data {
                  name
                  slug
                }
              }
            }
          }
          noDescriptionCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
              consultantsOrEngineers { 
                data {
                  name
                  slug
                }
              }
            }
          }
          upToDateCases {
            data {
              title
              slug
              lastUpdated
              daysSinceUpdate
              consultantsOrEngineers { 
                data {
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  }
`;
