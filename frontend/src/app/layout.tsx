"use client";

import "./globals.css";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { SessionProvider } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OmniscopeSidebar } from "./components/OmniscopeSidebar";
import { Separator } from "@/components/ui/separator";
import { OmniBreadcrumb } from "./components/OmniBreadcrumb";
import { SessionComponent } from "./components/SessionComponent";
import { InconsistencyAlerts } from "./components/InconsistencyAlerts";
import { OmniCommandsButton } from "./components/OmniCommands";

function createApolloClient(session: any) {
  const httpLink = createHttpLink({
    uri:
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://127.0.0.1:5001/graphql"
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
    if (
      networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401
    ) {
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
            {(session) =>
              session ? (
                <ApolloProvider client={createApolloClient(session)}>
                  <SidebarProvider>
                    <OmniscopeSidebar />
                    <SidebarInset>
                      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4 flex-1">
                          <SidebarTrigger className="-ml-1" />
                          <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                          />
                          <OmniBreadcrumb currentPage="Data Fetching" />
                          <div className="ml-auto">
                            <OmniCommandsButton />
                          </div>
                        </div>
                      </header>
                      <main>
                        <div className="container mx-auto px-4 py-4">
                          <InconsistencyAlerts />
                          {children}
                        </div>
                      </main>
                    </SidebarInset>
                  </SidebarProvider>
                </ApolloProvider>
              ) : null
            }
          </SessionComponent>
        </SessionProvider>
      </body>
    </html>
  );
}
