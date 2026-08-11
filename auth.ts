import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { DEFAULT_ROLE, isRole } from "@/lib/roles"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.active) {
          return null
        }

        if (!(await bcrypt.compare(password, user.passwordHash))) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: isRole(user.role) ? user.role : DEFAULT_ROLE,
        }
      },
    }),
  ],
})
