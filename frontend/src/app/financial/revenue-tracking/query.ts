import { gql } from "@apollo/client";

export const REVENUE_TRACKING_QUERY = gql`
  query RevenueTracking($date: Date!, $filters: [FilterInput]) {
    revenueTracking(dateOfInterest: $date, filters: $filters) {
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
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
        }
        byClient {
          name
          slug
          regular
          preContracted
          total
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
        }
        bySponsor {
          name
          slug
          regular
          preContracted
          total
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
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
      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`;
