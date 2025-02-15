import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($date: Date!, $filters: [FilterableFieldInput]) {
    financial {
      revenueForecast(dateOfInterest: $date, filters: $filters) {
        dateOfInterest
        filterableFields {
          field
          options
          selectedValues
        }
        daily {
          data {
            date
            actual {
              totalConsultingFee
              totalConsultingHours
              accTotalConsultingFee
              accTotalConsultingHours
            }
            expected {
              totalConsultingFee
              totalConsultingHours
              accTotalConsultingFee
              accTotalConsultingHours
            }
            difference {
              totalConsultingFee
              totalConsultingHours
              accTotalConsultingFee
              accTotalConsultingHours
            }
          }
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
              data {
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
            }
            byClient {
              data {
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
            }
            bySponsor {
              data {
                name
                slug
                client {
                  slug
                }
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
            byCase {
              data {
                title
                slug
                sponsor {
                  slug
                }
                client {
                  slug
                }
                startOfContract
                endOfContract
                weeklyApprovedHours
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
            byProject {
              data {
                name
                slug
                case {
                  slug
                }
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
              data {
                name
                slug
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
                inAnalysisConsultingPreHours
                oneMonthAgoConsultingPreHours
                twoMonthsAgoConsultingPreHours
                threeMonthsAgoConsultingPreHours
              }
            }
            bySponsor {
              data {
                name
                slug
                client {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
                inAnalysisConsultingPreHours
                oneMonthAgoConsultingPreHours
                twoMonthsAgoConsultingPreHours
                threeMonthsAgoConsultingPreHours
              }
            }
            byCase {
              data {
                title
                slug
                sponsor {
                  slug
                }
                client {
                  slug
                }
                startOfContract
                endOfContract
                weeklyApprovedHours
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
                inAnalysisConsultingPreHours
                oneMonthAgoConsultingPreHours
                twoMonthsAgoConsultingPreHours
                threeMonthsAgoConsultingPreHours
              }
            }
            byProject {
              data {
                name
                slug
                case {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
                inAnalysisConsultingPreHours
                oneMonthAgoConsultingPreHours
                twoMonthsAgoConsultingPreHours
                threeMonthsAgoConsultingPreHours
              }
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
              data {
                name
                slug
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            bySponsor {
              data {
                name
                slug
                client {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            byCase {
              data {
                title
                slug
                sponsor {
                  slug
                }
                client {
                  slug
                }
                startOfContract
                endOfContract
                weeklyApprovedHours
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            byProject {
              data {
                name
                slug
                case {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
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
              data {
                name
                slug
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            bySponsor {
              data {
                name
                slug
                client {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            byCase {
              data {
                title
                slug
                sponsor {
                  slug
                }
                client {
                  slug
                }
                startOfContract
                endOfContract
                weeklyApprovedHours
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
            byProject {
              data {
                name
                slug
                case {
                  slug
                }
                inAnalysis
                oneMonthAgo
                twoMonthsAgo
                threeMonthsAgo
              }
            }
          }
        }
      }
    }
  }
`;
