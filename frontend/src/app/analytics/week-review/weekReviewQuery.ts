import { gql } from "@apollo/client";

export const WEEK_REVIEW_QUERY = gql`
  query WeekReview($dateOfInterest: Date!, $filters: [FilterInput]) {
    weekReview(date_of_interest: $dateOfInterest, filters: $filters) {
      hoursPreviousWeeks
      hoursPreviousWeeksUntilThisDate
      hoursThisWeek
      
      sunday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      monday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      tuesday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      wednesday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      thursday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      friday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }
      saturday {
        worstDay
        worstDayHours
        bestDay
        bestDayHours
        averageHours
        totalHours
        dailySummary {
          date
          consulting
          squad
          handsOn
          internal
        }
      }

      monthSummary {
        hoursThisMonth
        hoursPreviousMonth
        hoursPreviousMonthUntilThisDate
        limitDate
      }

      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`;
