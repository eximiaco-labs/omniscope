import { gql } from "@apollo/client";

export const CONSULTING_HOURS_QUERY = gql`
  query ConsultingHours(
    $startDate: Date!
    $endDate: Date!
    $filters: [FilterableFieldInput]
  ) {
    engagements {
      summaries {
        consultingHours(
          startDate: $startDate
          endDate: $endDate
          filters: $filters
        ) {
          startDate
          endDate
          totalHours
          consultants {
            data {
              id
              name
              slug
              totalHours
              percentage
              projects {
                data {
                  name
                  hours
                  percentage
                }
              }
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
