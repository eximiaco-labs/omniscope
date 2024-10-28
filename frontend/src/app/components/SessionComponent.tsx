import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

interface SessionComponentProps {
  children: (session: any) => React.ReactNode;
}

export function SessionComponent({ children }: SessionComponentProps) {
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
