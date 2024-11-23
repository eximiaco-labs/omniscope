import { gql } from "@apollo/client";

export const REVENUE_TRACKING_QUERY = gql`
  query RevenueTracking($date: Date!) {
    revenueTracking(dateOfInterest: $date) {
      year
      month
      fixed {
        monthly {
          total
          byAccountManager {
            name
            fee
            byClient {
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
`;
