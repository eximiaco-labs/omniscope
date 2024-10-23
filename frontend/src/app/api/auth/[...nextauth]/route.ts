import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async signIn({ account, profile }) {
      return true;
    },
    async session({ session, token }) {  
      console.log("Session Callback - Token:", token)
      console.log("Session Callback - Current Session:", session)      
      // @ts-ignore
      session.accessToken = token.accessToken
      return session;
    },
    async jwt({ token, account }) {   
      console.log("JWT Callback - Account:", account)
      console.log("JWT Callback - Current Token:", token)         
      if (account) {
        token.accessToken = account.access_token;
        console.log("JWT Callback - New Token:", token)
      }
      return token;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };