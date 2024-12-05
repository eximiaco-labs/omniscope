import { gql } from "@apollo/client";

export const GET_CASE_BY_SLUG = gql`
  query GetCaseBySlug($slug: String!, $dataset1: String!, $dataset2: String!) {
    case(slug: $slug) {
      id
      slug
      title
      tracker {
        id
        name
        kind
        budget {
          hours
          period
        }
      }

      timesheet1: timesheet(slug: $dataset1) {
        appointments {
          kind
          date
          workerSlug
          workerName
          comment
          timeInHs
        }
        byDate {
          date
          totalHours
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
        }
      }

      timesheet2: timesheet(slug: $dataset2) {
        appointments {
          kind
          date
          workerSlug
          workerName
          comment
          timeInHs
        }
        byDate {
          date
          totalHours
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
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
