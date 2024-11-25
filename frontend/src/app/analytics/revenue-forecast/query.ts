import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($inAnalysisDate: Date!, $previousMonthDate: Date!, $previousMonthPartialDate: Date!) {
    in_analysis: revenueTracking(dateOfInterest: $inAnalysisDate) {
      summaries {
        byClient {
          name
          slug
          regular
          preContracted
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
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
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
          total
        }
      }
    }

    previous_month_partial: revenueTracking(
      dateOfInterest: $previousMonthPartialDate
    ) {
      summaries {
        byClient {
          name
          slug
          regular
          preContracted
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
          total
        }
      }
    }
  }
`;
