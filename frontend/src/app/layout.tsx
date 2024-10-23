"use client";

import "./globals.css";

import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import { Navbar } from "@/components/catalyst/navbar";
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { OmniscopeSidebar } from "@/app/components/OmniscopeSidebar";
import { InconsistencyAlerts } from "@/app/components/InconsistencyAlerts";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function createApolloClient(session: any) {
  const httpLink = createHttpLink({
    uri: typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? "http://127.0.0.1:5000/graphql"
      : "https://omniscope.eximia.co/graphql",
  });

  const authLink = setContext((_, prevContext) => {
    const token = session?.idToken;
    return {
      headers: {
        ...prevContext.headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const errorLink = onError(({ networkError }) => {
    if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
      console.log("Token expirado ou inválido. Fazendo logout...");
      signOut();
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

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
      <body>
        <SessionProvider>
          <SessionComponent>
            {(session) => (
              session ? (
                <ApolloProvider client={createApolloClient(session)}>
                  <SidebarLayout
                    sidebar={<OmniscopeSidebar />}
                    navbar={<Navbar />}
                  >
                    <InconsistencyAlerts />
                    <main>{children}</main>
                  </SidebarLayout>
                </ApolloProvider>
              ) : null
            )}
          </SessionComponent>
        </SessionProvider>
      </body>
    </html>
  );
}

function SessionComponent({ children }: { children: (session: any) => React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Redirecionando para login...");
      signIn("google");
    }
    if (session) {
      const expirationTime = new Date(session.expires).getTime() / 1000;
      const currentTime = Date.now() / 1000;

      if (expirationTime < currentTime) {
        console.log("Sessão expirada. Fazendo logout...");
        signOut();
      }
    }
  }, [session, status]);

  if (isLoading) {
    return null;
  }

  return children(session);
}
