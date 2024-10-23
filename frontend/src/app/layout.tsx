"use client";

import "./globals.css";

import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import { Navbar } from "@/components/catalyst/navbar";
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { OmniscopeSidebar } from "@/app/components/OmniscopeSidebar";
import { InconsistencyAlerts } from "@/app/components/InconsistencyAlerts";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { getSession } from "next-auth/react"

const httpLink = createHttpLink({
  uri: "https://omniscope.eximia.co/graphql"
});

const authLink =  setContext(async (_, { headers }) => {  
  const token = await getSession()
  console.log(token);
  // @ts-ignore
  if(!token || !token.accessToken) {
    return { headers }
  }

  return {
    headers: {
      ...headers,
      // @ts-ignore
      authorization: token ? `Bearer ${token.accessToken}` : "",
    }
  }
});

export const client = new ApolloClient({  
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950"
    >
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <title>Omniscope</title>
        <meta name="description" content="Analytics and management platform" />
      </head>
      <ApolloProvider client={client}>
        <body>
          <SessionProvider>
            <SessionComponent>
              {(session) => (
                session ? (
                  <SidebarLayout
                    sidebar={<OmniscopeSidebar />}
                    navbar={<Navbar>{/* Your navbar content */}</Navbar>}
                  >
                    <InconsistencyAlerts />
                    <main>{children}</main>
                  </SidebarLayout>
                ) : null
              )}
            </SessionComponent>
          </SessionProvider>
        </body>
      </ApolloProvider>
    </html>
  );
}

function SessionComponent({ children }: { children: (session: any) => React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

    if (status === "unauthenticated") {
      console.log("Redirecting to sign in...");
      signIn("google");
    }

    if (session) {
      console.log("User signed in:", session.user);
    }
  }, [session, status]);

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return children(session);
}
