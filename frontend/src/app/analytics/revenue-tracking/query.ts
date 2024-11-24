import { gql } from "@apollo/client";

export const REVENUE_TRACKING_QUERY = gql`
  query RevenueTracking($date: Date!) {
    revenueTracking(dateOfInterest: $date) {
      year
      month
      summaries {
        byMode {
          regular
          preContracted
          total
        }
        byKind {
          name
          regular
          preContracted
          total
        }
        byAccountManager {
          name
          regular
          preContracted
          total
        }
        byClient {
          name
          regular
          preContracted
          total
        }
        bySponsor {
          name
          regular
          preContracted
          total
        }
      }
      regular {
        monthly {
          byAccountManager {
            name
            fee
            byClient {
              name
              fee
              bySponsor {
                name
                fee
                byCase {
                  title
                  fee
                  byProject {
                    kind
                    name
                    fee
                    rate
                    hours
                  }
                }
              }
            }
          }
          total
        }
      }
      preContracted {
        monthly {
          total
          byAccountManager {
            name
            fee
            byClient {
              name
              fee
              bySponsor {
                name
                fee
                byCase {
                  title
                  fee
                  byProject {
                    kind
                    name
                    fee
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
