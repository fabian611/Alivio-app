import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "@/auth"
import { isRole, type Role } from "@/lib/roles"

export const getSession = cache(async () => auth())

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user && isRole(session.user.role) ? session.user : null
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function requireRole(...allowed: Role[]) {
  const user = await requireUser()

  if (!allowed.includes(user.role)) {
    redirect("/unauthorized")
  }

  return user
}
