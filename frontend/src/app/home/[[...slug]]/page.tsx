"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";
import AccountManagerHome from "../../about-us/account-managers/[slug]/page";
import ConsultantOrEngineerHome from "./ConsultantOrEngineerHome";
import Header from "./Header";

const GET_USER = gql`
  query GetUser($slug: String, $email: String) {
    user(slug: $slug, email: $email) {
      name
      photoUrl
      email
      position
      kind
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Header user={user} />
      {user && user.kind === "ACCOUNT_MANAGER" && <AccountManagerHome user={user} />}
      {user && user.kind === "CONSULTANT" && <ConsultantOrEngineerHome user={user} />}
    </div>
  );
}

