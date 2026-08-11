import bcrypt from "bcryptjs"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import {
  usuarioAsignarCompaniaSchema,
  usuarioCreateSchema,
  usuarioDeleteSchema,
  usuarioUpdateSchema,
} from "@/lib/validations/usuario"

const SELECT = {
  id: true,
  name: true,
  email: true,
  cargo: true,
  role: true,
  active: true,
  companiaId: true,
  createdAt: true,
  compania: { select: { id: true, nombre: true } },
} as const

async function parseBody<T extends z.ZodType>(request: NextRequest, schema: T) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    throw new ApiError(400, "El cuerpo de la petición no es JSON válido.")
  }

  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new ApiError(
      422,
      "Revisa los datos enviados.",
      z.flattenError(parsed.error).fieldErrors
    )
  }

  return parsed.data as z.output<T>
}

async function assertCompaniaExists(companiaId: string | null) {
  if (!companiaId) return

  const compania = await prisma.compania.findUnique({
    where: { id: companiaId },
    select: { id: true },
  })

  if (!compania) {
    throw new ApiError(422, "La compañía seleccionada no existe.")
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const companiaId = request.nextUrl.searchParams.get("companiaId")
    const take = Number(request.nextUrl.searchParams.get("take")) || undefined

    const usuarios = await prisma.user.findMany({
      where: companiaId ? { companiaId } : undefined,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      take,
    })

    return NextResponse.json({ data: usuarios })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const { password, ...data } = await parseBody(request, usuarioCreateSchema)

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    })

    if (existing) {
      throw new ApiError(409, "Ya existe un usuario con ese correo.")
    }

    await assertCompaniaExists(data.companiaId)

    const usuario = await prisma.user.create({
      data: { ...data, passwordHash: await bcrypt.hash(password, 12) },
      select: SELECT,
    })

    return NextResponse.json({ data: usuario }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await requireApiRole("admin")

    const { id, password, ...data } = await parseBody(
      request,
      usuarioUpdateSchema
    )

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!target) {
      throw new ApiError(404, "El usuario no existe.")
    }

    const duplicated = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    })

    if (duplicated && duplicated.id !== id) {
      throw new ApiError(409, "Ya existe otro usuario con ese correo.")
    }

    await assertCompaniaExists(data.companiaId)

    if (actor.id === id && (data.role !== "admin" || !data.active)) {
      throw new ApiError(
        409,
        "No puedes quitarte a ti mismo el rol de administrador ni desactivarte."
      )
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
      select: SELECT,
    })

    return NextResponse.json({ data: usuario })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const { ids, companiaId } = await parseBody(
      request,
      usuarioAsignarCompaniaSchema
    )

    await assertCompaniaExists(companiaId)

    const { count } = await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { companiaId },
    })

    return NextResponse.json({ data: { count } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireApiRole("admin")

    const id = request.nextUrl.searchParams.get("id")
    const parsed = usuarioDeleteSchema.safeParse({ id })

    if (!parsed.success) {
      throw new ApiError(400, "Debes indicar el id del usuario.")
    }

    if (actor.id === parsed.data.id) {
      throw new ApiError(409, "No puedes eliminar tu propio usuario.")
    }

    const usuario = await prisma.user.findUnique({
      where: { id: parsed.data.id },
      select: { id: true },
    })

    if (!usuario) {
      throw new ApiError(404, "El usuario no existe.")
    }

    await prisma.user.delete({ where: { id: parsed.data.id } })

    return NextResponse.json({ data: { id: parsed.data.id } })
  } catch (error) {
    return handleApiError(error)
  }
}
