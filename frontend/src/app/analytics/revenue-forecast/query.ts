import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($inAnalysisDate: Date!, $previousMonthDate: Date!) {
    in_analysis: revenueTracking(dateOfInterest: $inAnalysisDate) {
      summaries {
        byClient {
          name
          slug
          regular
          preContracted
          total
        }
      }
    }
    previous_month: revenueTracking(dateOfInterest: $previousMonthDate) {
      summaries {
        byClient {
          name
          slug
          regular
          preContracted
          total
        }
      }
    }
  }
`;