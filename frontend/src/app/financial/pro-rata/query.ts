import { gql } from "@apollo/client";

export const PRO_RATA_QUERY = gql`
  query ProRata($dateOfInterest: Date!) {
    revenueTracking(dateOfInterest: $dateOfInterest) {
      month
      year 
      day
      proRataInfo {
        byKind {
          kind
          penalty
          byAccountManager {
            name
            penalty
            byClient {
              name
              penalty
              bySponsor {
                name
                penalty
                byCase {
                  title
                  penalty
                  byProject {
                    name
                    partialFee
                    penalty
                    byWorker {
                      name
                      hours
                      partialFee
                      penalty
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
