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
        lastDayOfOneMonthAgo
        sameDayTwoMonthsAgo
        lastDayOfTwoMonthsAgo
        sameDayThreeMonthsAgo
        lastDayOfThreeMonthsAgo
        sameDayOneMonthLater
        lastDayOfOneMonthLater
        sameDayTwoMonthsLater
        lastDayOfTwoMonthsLater
        sameDayThreeMonthsLater
        lastDayOfThreeMonthsLater
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
        oneMonthLater
        twoMonthsLater
        threeMonthsLater
      }
      summary {
        realized
        projected
        expected
        oneMonthAgo
        twoMonthsAgo
        threeMonthsAgo
        inAnalysisConsultingHours
        oneMonthAgoConsultingHours
        sameDayOneMonthAgoConsultingHours
        twoMonthsAgoConsultingHours
        sameDayTwoMonthsAgoConsultingHours
        threeMonthsAgoConsultingHours
        sameDayThreeMonthsAgoConsultingHours
        inAnalysisConsultingPreHours
        oneMonthAgoConsultingPreHours
        twoMonthsAgoConsultingPreHours
        threeMonthsAgoConsultingPreHours
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
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
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
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
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
            expectedOneMonthLater
            expectedTwoMonthsLater
            expectedThreeMonthsLater
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
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
            expectedOneMonthLater
            expectedTwoMonthsLater
            expectedThreeMonthsLater
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
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
            expectedOneMonthLater
            expectedTwoMonthsLater
            expectedThreeMonthsLater
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
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
            expectedOneMonthLater
            expectedTwoMonthsLater
            expectedThreeMonthsLater
            inAnalysisConsultingHours
            oneMonthAgoConsultingHours
            sameDayOneMonthAgoConsultingHours
            twoMonthsAgoConsultingHours
            sameDayTwoMonthsAgoConsultingHours
            threeMonthsAgoConsultingHours
            sameDayThreeMonthsAgoConsultingHours
          }
        }
        consultingPre {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
            inAnalysisConsultingPreHours
            oneMonthAgoConsultingPreHours
            twoMonthsAgoConsultingPreHours
            threeMonthsAgoConsultingPreHours
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
