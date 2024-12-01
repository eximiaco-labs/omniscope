import { gql } from "@apollo/client";

export const GET_CONSULTANT = gql`
  query GetConsultant($slug: String!, $dataset: String!) {
    consultantOrEngineer(slug: $slug) {
      photoUrl
      name
      position

      timesheet(slug: $dataset) {
        byDate {
          date
          totalHours
        }
      }
    }
  }
`;

export interface Consultant {
  photoUrl: string;
  name: string;
  position: string;

  timesheet: {
    byDate: Array<{
      date: string;
      totalHours: number;
    }>;
  };
}
