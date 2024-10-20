"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import { useParams } from "next/navigation";
import AccountManagerHome from "./AccountManagerHome";


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
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar
              src={user?.photoUrl || "/profile-photo.jpg"}
              className="h-20 w-20 rounded-full ring-4 ring-blue-500 mr-6"
              alt={user?.name || "User"}
            />
            <div>
              <Heading className="text-3xl font-bold text-gray-800">
                Welcome back, {user?.name || "User"}!
              </Heading>
              {user?.position && (
                <p className="text-lg text-gray-600 mt-1">{user.position}</p>
              )}
            </div>
          </div>
          {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
        </div>
      </header>

      {user && user.kind === "ACCOUNT_MANAGER" && <AccountManagerHome user={user} />}
    </div>
  );
}
