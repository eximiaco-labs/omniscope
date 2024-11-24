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
          slug
          regular
          preContracted
          total
        }
        byClient {
          name
          slug
          regular
          preContracted
          total
        }
        bySponsor {
          name
          slug
          regular
          preContracted
          total
        }
      }
      regular {
        monthly {
          byAccountManager {
            name
            slug
            fee
            byClient {
              name
              slug
              fee
              bySponsor {
                name
                slug
                fee
                byCase {
                  title
                  slug
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
            slug
            fee
            byClient {
              name
              slug
              fee
              bySponsor {
                name
                slug
                fee
                byCase {
                  title
                  slug
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
