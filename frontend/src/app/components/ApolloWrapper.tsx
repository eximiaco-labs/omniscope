import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { signOut } from "next-auth/react";
import { createContext, useContext } from "react";

import { BatchHttpLink } from "@apollo/client/link/batch-http";

function createApolloClient(session: any, version: 'default' | 'edge' = 'default') {
  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
  
  const baseUrl = isLocalhost
    ? version === 'edge' 
      ? "http://127.0.0.1:5001"
      : "http://127.0.0.1:5001"
    : version === 'edge'
      ? "https://omniscope.eximia.co"
      : "https://omniscope.eximia.co";

  // Create the appropriate link based on version
  const httpLink = version === 'edge'
    ? new BatchHttpLink({
        uri: `${baseUrl}/graphql`,
        batchInterval: 10,
        batchMax: 10,
      })
    : createHttpLink({
        uri: `${baseUrl}/graphql`,
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
    name: version,
  });
}

export default createApolloClient;

const EdgeClientContext = createContext<ApolloClient<any> | null>(null);

export function useEdgeClientContext() {
  return useContext(EdgeClientContext);
}

export function ApolloWrapper({ children, session }: { children: React.ReactNode; session: any }) {
  const defaultClient = createApolloClient(session, 'default');
  const edgeClient = createApolloClient(session, 'edge');

  return (
    <ApolloProvider client={defaultClient}>
      <EdgeClientContext.Provider value={edgeClient}>
        {children}
      </EdgeClientContext.Provider>
    </ApolloProvider>
  );
} 