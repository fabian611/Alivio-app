import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import {
  companiaCreateSchema,
  companiaDeleteSchema,
  companiaUpdateSchema,
} from "@/lib/validations/compania"

const SELECT = {
  id: true,
  nit: true,
  nombre: true,
  nombreCorto: true,
  fechaInicial: true,
  urlCargue: true,
  createdAt: true,
  _count: { select: { usuarios: true } },
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

function isRecordNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  )
}

export async function GET() {
  try {
    await requireApiRole("admin")

    const companias = await prisma.compania.findMany({
      select: SELECT,
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json({ data: companias })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const data = await parseBody(request, companiaCreateSchema)

    if (data.nit) {
      const existing = await prisma.compania.findUnique({
        where: { nit: data.nit },
        select: { id: true },
      })

      if (existing) {
        throw new ApiError(409, "Ya existe una compañía con ese NIT.")
      }
    }

    const compania = await prisma.compania.create({
      data,
      select: SELECT,
    })

    return NextResponse.json({ data: compania }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const { id, ...data } = await parseBody(request, companiaUpdateSchema)

    if (data.nit) {
      const existing = await prisma.compania.findUnique({
        where: { nit: data.nit },
        select: { id: true },
      })

      if (existing && existing.id !== id) {
        throw new ApiError(409, "Ya existe otra compañía con ese NIT.")
      }
    }

    try {
      const compania = await prisma.compania.update({
        where: { id },
        data,
        select: SELECT,
      })

      return NextResponse.json({ data: compania })
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new ApiError(404, "La compañía no existe.")
      }
      throw error
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireApiRole("admin")

    const id = request.nextUrl.searchParams.get("id")
    const parsed = companiaDeleteSchema.safeParse({ id })

    if (!parsed.success) {
      throw new ApiError(400, "Debes indicar el id de la compañía.")
    }

    const compania = await prisma.compania.findUnique({
      where: { id: parsed.data.id },
      select: { _count: { select: { usuarios: true } } },
    })

    if (!compania) {
      throw new ApiError(404, "La compañía no existe.")
    }

    if (compania._count.usuarios > 0) {
      throw new ApiError(
        409,
        `No puedes eliminarla: tiene ${compania._count.usuarios} usuario(s) asociado(s).`
      )
    }

    await prisma.compania.delete({ where: { id: parsed.data.id } })

    return NextResponse.json({ data: { id: parsed.data.id } })
  } catch (error) {
    return handleApiError(error)
  }
}
