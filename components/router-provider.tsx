"use client"

import { useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"

export function AriaRouterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <RouterProvider navigate={(href) => router.push(href)}>
      {children}
    </RouterProvider>
  )
}
