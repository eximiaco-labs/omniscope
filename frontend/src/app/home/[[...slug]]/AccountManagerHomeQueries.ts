import { gql } from "@apollo/client";

export const GET_HOME_DATA = gql`
  query GetClientStats($accountManagerName: String, $filters: [FilterInput]) {
    clients(accountManagerName: $accountManagerName) {
      id
    }
    timesheet(slug: "last-six-weeks", kind: ALL, filters: $filters) {
      uniqueClients
      uniqueCases
      uniqueWorkers
      totalHours
      
      byKind {
        consulting {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        handsOn {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        squad {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
        internal {
          uniqueClients
          uniqueCases
          uniqueWorkers
          totalHours
        }
      }

      byClient {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueClients
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }

      bySponsor {
        name
        uniqueCases
        uniqueWorkers
        totalHours
        byKind {
          consulting {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          handsOn {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          squad {
            uniqueCases
            uniqueWorkers
            totalHours
          }
          internal {
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }
      }

      byWorker {
        name
        uniqueClients
        uniqueCases
        totalHours
        byKind {
          consulting {
            uniqueClients
            uniqueCases
            totalHours
          }
          handsOn {
            uniqueClients
            uniqueCases
            totalHours
          }
          squad {
            uniqueClients
            uniqueCases
            totalHours
          }
          internal {
            uniqueClients
            uniqueCases
            totalHours
          }
        }
      }

      byCase {
        title
        totalHours
        totalConsultingHours
        totalHandsOnHours
        totalSquadHours
        totalInternalHours
        caseDetails {
          startOfContract
          endOfContract
          weeklyApprovedHours
          client {
            name
          }
          lastUpdate {
            date
            status
          }
        }
      }
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($filters: [FilterInput], $dateOfInterest: Date!) {
    weekReview(date_of_interest: $dateOfInterest, filters: $filters) {
      hoursPreviousWeeks
      hoursPreviousWeeksUntilThisDate
      hoursThisWeek

      monthSummary {
        hoursThisMonth
        hoursPreviousMonth
        hoursPreviousMonthUntilThisDate
        limitDate
      }
    }

    timelinessReview(date_of_interest: $dateOfInterest, filters: $filters) {
      totalRows

      earlyRows
      earlyTimeInHours

      okRows
      okTimeInHours

      acceptableRows
      acceptableTimeInHours

      lateRows
      lateTimeInHours

      earlyWorkers {
        worker
        entries
        timeInHours
      }

      okWorkers {
        worker
        entries
        timeInHours
      }

      acceptableWorkers {
        worker
        entries
        timeInHours
      }

      lateWorkers {
        worker
        entries
        timeInHours
      }

      minDate
      maxDate
    }
  }
`;
