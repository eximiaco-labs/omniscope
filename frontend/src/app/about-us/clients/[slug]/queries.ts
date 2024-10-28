import { gql } from "@apollo/client";

export const GET_CLIENT_BY_SLUG = gql`
  query GetClientBySlug($slug: String!) {
    client(slug: $slug) {
      name
      logoUrl
      isStrategic
    }
  }
`;
