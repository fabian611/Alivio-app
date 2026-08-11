import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/dal"
import { homeFor } from "@/lib/roles"

export default async function RootPage() {
  const user = await getCurrentUser()

  redirect(user ? homeFor(user.role) : "/login")
}
