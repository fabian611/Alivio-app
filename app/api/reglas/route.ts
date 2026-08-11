import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireCompania } from "@/lib/api-guard"
import { condicionesSchema } from "@/lib/condiciones"
import { prisma } from "@/lib/prisma"
import {
  reglaCreateSchema,
  reglaDeleteSchema,
  reglaUpdateSchema,
} from "@/lib/validations/regla"

const SELECT = {
  id: true,
  nombre: true,
  descripcion: true,
  condiciones: true,
  canal: true,
  responsables: true,
  activa: true,
  createdAt: true,
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

async function assertNegociadores(ids: string[], companiaId: string) {
  const validos = await prisma.user.count({
    where: { id: { in: ids }, role: "negociador", companiaId, active: true },
  })

  if (validos !== ids.length) {
    throw new ApiError(
      422,
      "Solo puedes asignar negociadores activos de tu compañía."
    )
  }
}

export async function GET() {
  try {
    const { companiaId } = await requireCompania("gestor")

    const reglas = await prisma.regla.findMany({
      where: { companiaId },
      select: SELECT,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      data: reglas.map((regla) => ({
        ...regla,
        createdAt: regla.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companiaId, email } = await requireCompania("gestor")
    const data = await parseBody(request, reglaCreateSchema)

    await assertNegociadores(data.responsables, companiaId)

    const regla = await prisma.regla.create({
      data: { ...data, companiaId, creadaPor: email ?? null },
      select: SELECT,
    })

    return NextResponse.json({ data: regla }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { companiaId } = await requireCompania("gestor")
    const { id, ...data } = await parseBody(request, reglaUpdateSchema)

    const existente = await prisma.regla.findFirst({
      where: { id, companiaId },
      select: { id: true },
    })

    if (!existente) {
      throw new ApiError(404, "La regla no existe.")
    }

    await assertNegociadores(data.responsables, companiaId)

    const regla = await prisma.regla.update({
      where: { id },
      data,
      select: SELECT,
    })

    return NextResponse.json({ data: regla })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { companiaId } = await requireCompania("gestor")

    const parsed = reglaDeleteSchema.safeParse({
      id: request.nextUrl.searchParams.get("id"),
    })

    if (!parsed.success) {
      throw new ApiError(400, "Debes indicar el id de la regla.")
    }

    const { count } = await prisma.regla.deleteMany({
      where: { id: parsed.data.id, companiaId },
    })

    if (count === 0) {
      throw new ApiError(404, "La regla no existe.")
    }

    return NextResponse.json({ data: { id: parsed.data.id } })
  } catch (error) {
    return handleApiError(error)
  }
}
