import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      authorization: {
        params: {
          // prompt: "consent",
          // access_type: "offline",
          // response_type: "code",
          token_endpoint_auth_method: "client_secret_post",
          redirect_uri: `$https://localhost/oidc/google/callback`
        }
      },
      
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/oidc/google/callback`
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
