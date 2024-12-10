import { gql } from "@apollo/client";

export const STALELINESS_QUERY = gql`
  query StalenessQuery {
    cases(onlyActives: true) {
      slug
      title
      startOfContract
      hasDescription
      lastUpdated
      timesheet(slug: "last-six-weeks") {
        byWorker {
          name
        }
      }
    }
  }
`;
