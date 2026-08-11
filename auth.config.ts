import type { NextAuthConfig } from "next-auth"

import { DEFAULT_ROLE, isRole } from "@/lib/roles"

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = isRole(user.role) ? user.role : DEFAULT_ROLE
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? session.user.id
      session.user.role = isRole(token.role) ? token.role : DEFAULT_ROLE
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
