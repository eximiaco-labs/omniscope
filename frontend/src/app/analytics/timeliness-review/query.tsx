import { gql } from "@apollo/client";

export const TIMELINESS_REVIEW_QUERY = gql`
  query TimelinessReview($date_of_interest: Date!, $filters: [FilterInput]) {
    timelinessReview(date_of_interest: $date_of_interest, filters: $filters) {
      earlyWorkers {
        worker
        timeInHours
        entries
      }

      okWorkers {
        worker
        timeInHours
        entries
      }

      acceptableWorkers {
        worker
        timeInHours
        entries
      }

      lateWorkers {
        worker
        timeInHours
        entries
      }
        
      filterableFields {
        field
        options
        selectedValues
      }
    }
  }
`;
