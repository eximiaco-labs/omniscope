import { gql } from "@apollo/client";

export const GET_CASE_BY_SLUG = gql`
  query GetCaseBySlug($slug: String!) {
    case(slug: $slug) {
      id
      slug
      title
      isActive
      preContractedValue
      sponsor
      hasDescription
      everhourProjectsIds
      startOfContract
      endOfContract
      weeklyApprovedHours
      tracker {
        id
        name
      }
      client {
        name
        logoUrl
      }
      lastUpdate {
        date
        author
        status
        observations
      }
      timesheets {
        lastSixWeeks {
          byKind {
            consulting {
              totalHours
              byWorker {
                name
                weeklyHours {
                  week
                  hours
                }
              }
            }
            handsOn {
              totalHours
              byWorker {
                name
                weeklyHours {
                  week
                  hours
                }
              }
            }
            squad {
              totalHours
              byWorker {
                name
                weeklyHours {
                  week
                  hours
                }
              }
            }
            internal {
              totalHours
              byWorker {
                name
                weeklyHours {
                  week
                  hours
                }
              }
            }
          }
        }
      }
    }
  }
`;
