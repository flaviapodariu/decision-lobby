import { Awaitable, NextAuthOptions, User, Session } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials, req) {
        const { email, password } = credentials as { email: string; password: string };

        const body = {
          email: email,
          password: password,
        };
        const res = await fetch(" http://localhost:5000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        // console.log(res);
        if (res.status !== 200) {
          return null;
        } else {
          return { id: "1231", email: email };
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
};
export default NextAuth(authOptions);
