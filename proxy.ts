import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/auth.config"
import { canAccess, homeFor, isRole } from "@/lib/roles"

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = new Set(["/login"])

export default auth((request) => {
  const { nextUrl } = request
  const { pathname } = nextUrl
  const role = request.auth?.user?.role

  if (!isRole(role)) {
    if (PUBLIC_ROUTES.has(pathname)) {
      return NextResponse.next()
    }

    const target = new URL("/login", nextUrl)
    target.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`)
    return NextResponse.redirect(target)
  }

  if (PUBLIC_ROUTES.has(pathname) || pathname === "/") {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl))
  }

  if (!canAccess(role, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
}
