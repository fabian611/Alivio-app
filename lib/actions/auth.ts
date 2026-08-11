"use server"

import { AuthError } from "next-auth"
import { z } from "zod"

import { signIn, signOut } from "@/auth"
import { loginSchema } from "@/lib/validations/auth"

export type LoginState = {
  message?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}

function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/"
  }

  return value.startsWith("//") || value.startsWith("/\\") ? "/" : value
}

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message:
          error.type === "CredentialsSignin"
            ? "Correo o contraseña incorrectos."
            : "No pudimos iniciar tu sesión. Intenta de nuevo.",
      }
    }

    throw error
  }

  return {}
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
