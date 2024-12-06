import { gql } from "@apollo/client";

export const TIMELINESS_REVIEW_QUERY = gql`
  query TimelinessReview($date_of_interest: Date!, $filters: [FilterInput]) {
    timelinessReview(date_of_interest: $date_of_interest, filters: $filters) {
      earlyWorkers {
        worker
        workerSlug
        timeInHours
        entries
      }

      okWorkers {
        worker
        workerSlug
        timeInHours
        entries
      }

      acceptableWorkers {
        worker
        workerSlug
        timeInHours
        entries
      }

      lateWorkers {
        worker
        workerSlug
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
