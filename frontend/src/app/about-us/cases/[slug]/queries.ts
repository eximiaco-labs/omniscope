import { gql } from "@apollo/client";

export const GET_CASE_BY_SLUG = gql`
  query GetCaseBySlug($slug: String!) {
    case(slug: $slug) {
      id
      slug
      title
      tracker {
        id
        name
        budget {
          hours
          period
        }
      }
      updates {
        author
        date
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
          byCase {
            workersByTrackingProject {
              projectId
              workers
            }
          }
        }
      }
    }
  }
`;
