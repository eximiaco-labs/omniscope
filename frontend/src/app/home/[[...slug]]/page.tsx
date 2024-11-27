"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";

const GET_USER = gql`
  query GetUser($slug: String, $email: String) {
    user(slug: $slug, email: $email) {
      kind
      slug
    }
  }
`;

export default function HomePage() {
  const { data: session } = useSession();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : undefined;

  const { loading: userLoading, data: userData } = useQuery(GET_USER, {
    variables: {
      slug: slug || undefined,
      email: !slug ? session?.user?.email : undefined,
    },
    skip: !slug && !session?.user?.email,
  });

  const user = userData?.user;

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user?.kind === "ACCOUNT_MANAGER") {
    redirect(`/about-us/account-managers/${user.slug}`);
  }
  else {
    redirect(`/about-us/consultants-and-engineers/${user.slug}`);
  }
}
