import { gql } from "@apollo/client";

export const TIMELINESS_REVIEW_QUERY = gql`
  query TimelinessReview($date_of_interest: Date!, $filters: [FilterableFieldInput]) {
    engagements {
      summaries {
        timeliness(dateOfInterest: $date_of_interest, filters: $filters) {
          earlyWorkers {
            data {
              consultantOrEngineer { slug, name }
              timeInHours
              entries
            }
          }
          okWorkers {
            data {
              consultantOrEngineer { slug, name }
              timeInHours
              entries
            }
          }
          acceptableWorkers {
            data {
              consultantOrEngineer { slug, name }
              timeInHours
              entries
            }
          }
          lateWorkers {
            data {
              consultantOrEngineer { slug, name }
              timeInHours
              entries
            }
          }
          filterableFields {
            field
            options
            selectedValues
          }
        }
      }
    }
  }
`;
