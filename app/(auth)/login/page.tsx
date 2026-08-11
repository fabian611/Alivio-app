import type { Metadata } from "next"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Inicia sesión",
}

function normalizeCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/"
  }

  return value.startsWith("//") || value.startsWith("/\\") ? "/" : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <LoginForm callbackUrl={normalizeCallbackUrl(callbackUrl)} />
      </div>
    </div>
  )
}
