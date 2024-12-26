import { gql } from "@apollo/client";

export const GET_CASE_BY_SLUG = gql`
  query GetCaseBySlug($slug: String!, $dataset1: String!, $dataset2: String!) {
    case(slug: $slug) {
      id
      slug
      title
      ontologyUrl
      startOfContract
      endOfContract
      weeklyApprovedHours
      preContractedValue
      isActive
      sponsor

      client {
        logoUrl
        name
      }

      forecast {
        dateOfInterest
        filterableFields {
          field
          options
          selectedValues
        }
        dates {
          sameDayOneMonthAgo
          lastDayOfOneMonthAgo
          sameDayTwoMonthsAgo
          lastDayOfTwoMonthsAgo
          sameDayThreeMonthsAgo
          lastDayOfThreeMonthsAgo
        }
        summary {
          realized
          projected
          expected
          oneMonthAgo
          twoMonthsAgo
          threeMonthsAgo
        }
      }

      tracker {
        id
        name
        kind
        dueOn
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
        businessCalendar {
          holidays {
            date
            reason
          }
          workingDays
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
        businessCalendar {
          holidays {
            date
            reason
          }
          workingDays
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
