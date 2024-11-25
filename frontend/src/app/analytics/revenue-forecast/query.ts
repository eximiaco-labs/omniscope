import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($inAnalysisDate: Date!, $previousMonthDate: Date!, $previousMonthPartialDate: Date!, $twoMonthsAgoDate: Date!, $twoMonthsAgoPartialDate: Date!, $threeMonthsAgoDate: Date!, $threeMonthsAgoPartialDate: Date!) {
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

    two_months_ago: revenueTracking(dateOfInterest: $twoMonthsAgoDate) {
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

    two_months_ago_partial: revenueTracking(dateOfInterest: $twoMonthsAgoPartialDate) {
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

    three_months_ago: revenueTracking(dateOfInterest: $threeMonthsAgoDate) {
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

    three_months_ago_partial: revenueTracking(dateOfInterest: $threeMonthsAgoPartialDate) {
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
