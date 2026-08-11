import "server-only"

import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isRole, type Role } from "@/lib/roles"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
  }
}

export async function requireApiRole(...allowed: Role[]) {
  const session = await auth()
  const user = session?.user

  if (!user || !isRole(user.role)) {
    throw new ApiError(401, "Debes iniciar sesión.")
  }

  if (!allowed.includes(user.role)) {
    throw new ApiError(403, "No tienes permisos para esta operación.")
  }

  return user
}

export async function requireCompania(...allowed: Role[]) {
  const user = await requireApiRole(...allowed)

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { companiaId: true, active: true },
  })

  if (!row?.active) {
    throw new ApiError(403, "Tu usuario está inactivo.")
  }

  if (!row.companiaId) {
    throw new ApiError(
      409,
      "Tu usuario no tiene una compañía asignada. Pide a un administrador que te asigne una."
    )
  }

  return { ...user, companiaId: row.companiaId }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details ?? null },
      { status: error.status }
    )
  }

  console.error(error)

  return NextResponse.json(
    { error: "Ocurrió un error inesperado." },
    { status: 500 }
  )
}
