"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

const GET_USER = gql`
  query GetUser($slug: String, $email: String) {
    admin {
      user(slug: $slug, email: $email) {
        kind
        slug
      }
    }
  }
`;

export default function HomePage() {
  const { data: session } = useSession();
  const params = useParams();
  const client = useEdgeClient();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : undefined;

  const { loading: userLoading, data: userData } = useQuery(GET_USER, {
    variables: {
      slug: slug || undefined,
      email: !slug ? session?.user?.email : undefined,
    },
    skip: !slug && !session?.user?.email,
    client: client ?? undefined,
    ssr: true
  });

  const user = userData?.admin?.user;

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user?.kind === "ACCOUNT_MANAGER") {
    redirect(`/team/account-managers/${user.slug}`);
  }
  else {
    redirect(`/team/consultants-or-engineers/${user.slug}`);
  }
}
