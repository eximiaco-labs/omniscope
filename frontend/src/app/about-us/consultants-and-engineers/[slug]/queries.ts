import { gql } from "@apollo/client";

export const GET_CONSULTANT = gql`
  query GetConsultant($slug: String!, $dataset1: String!, $dataset2: String!) {
    consultantOrEngineer(slug: $slug) {
      photoUrl
      name
      position

      timesheet1: timesheet(slug: $dataset1) {
        appointments {
          kind
          date
          clientSlug
          clientName
          sponsorSlug
          sponsor
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
          clientSlug
          clientName
          sponsorSlug
          sponsor
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
    }
  }
`;

export interface Consultant {
  photoUrl: string;
  name: string;
  position: string;

  timesheet1: {
    appointments: Array<{
      kind: string;
      date: string;
      clientSlug: string;
      clientName: string;
      sponsorSlug: string;
      sponsor: string;
      comment: string;
      timeInHs: number;
    }>;
    byDate: Array<{
      date: string;
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };

  timesheet2: {
    appointments: Array<{
      kind: string;
      date: string;
      clientSlug: string;
      clientName: string;
      sponsorSlug: string;
      sponsor: string;
      comment: string;
      timeInHs: number;
    }>;
    byDate: Array<{
      date: string;
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };
}
