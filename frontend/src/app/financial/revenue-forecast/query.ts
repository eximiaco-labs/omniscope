import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($dateOfInterest: Date!, $filters: [FilterInput]) {
    forecast(dateOfInterest: $dateOfInterest, filters: $filters) {
      dateOfInterest
      filterableFields {
        field
        options
        selectedValues
      }
      dates {
        inAnalysis
        sameDayOneMonthAgo
        oneMonthAgo
        sameDayTwoMonthsAgo
        twoMonthsAgo
        sameDayThreeMonthsAgo
        threeMonthsAgo
      }
      workingDays {
        inAnalysisPartial
        inAnalysis
        oneMonthAgo
        sameDayOneMonthAgo
        twoMonthsAgo
        sameDayTwoMonthsAgo
        threeMonthsAgo
        sameDayThreeMonthsAgo
      }
      summary {
        realized
        projected
        expected
        oneMonthAgo
        twoMonthsAgo
        threeMonthsAgo
      }
      byKind {
        consulting {
          totals {
            inAnalysis
            inAnalysisConsultingFeeNew
            projected
            expected
            expectedHistorical
            oneMonthAgo
            oneMonthAgoConsultingFeeNew
            sameDayOneMonthAgo
            sameDayOneMonthAgoConsultingFeeNew
            twoMonthsAgo
            twoMonthsAgoConsultingFeeNew
            sameDayTwoMonthsAgo
            sameDayTwoMonthsAgoConsultingFeeNew
            threeMonthsAgo
            threeMonthsAgoConsultingFeeNew
            sameDayThreeMonthsAgo
            sameDayThreeMonthsAgoConsultingFeeNew
          }
          byConsultant {
            name
            slug
            inAnalysis
            expectedHistorical
            projected
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
          byClient {
            name
            slug
            inAnalysis
            projected
            expected
            expectedHistorical
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
          bySponsor {
            name
            slug
            clientSlug
            inAnalysis
            projected
            expected
            expectedHistorical
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
          byCase {
            title
            slug
            sponsorSlug
            clientSlug
            inAnalysis
            projected
            expected
            expectedHistorical
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
          byProject {
            name
            slug
            caseSlug
            inAnalysis
            projected
            expected
            expectedHistorical
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
        }
        consultingPre {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            slug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          bySponsor {
            name
            slug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byCase {
            title
            slug
            sponsorSlug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byProject {
            name
            slug
            caseSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
        handsOn {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            slug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          bySponsor {
            name
            slug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byCase {
            title
            slug
            sponsorSlug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byProject {
            name
            slug
            caseSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
        squad {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            slug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          bySponsor {
            name
            slug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byCase {
            title
            slug
            sponsorSlug
            clientSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byProject {
            name
            slug
            caseSlug
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
      }
    }
  }
`;
