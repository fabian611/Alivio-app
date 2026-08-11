import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import { gestionCreateSchema } from "@/lib/validations/gestion"

const SELECT = {
  id: true,
  creditoId: true,
  negociador: true,
  tipoContacto: true,
  negociacion: true,
  subaccion: true,
  fechaCompromiso: true,
  compromisoCliente: true,
  createdAt: true,
  credito: {
    select: { nroCredito: true, deudor: true, pagaduria: true },
  },
} as const

function serializar(gestion: {
  fechaCompromiso: Date | null
  createdAt: Date
}) {
  return {
    ...gestion,
    fechaCompromiso: gestion.fechaCompromiso?.toISOString() ?? null,
    createdAt: gestion.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiRole("negociador")

    const creditoId = request.nextUrl.searchParams.get("creditoId")

    const gestiones = await prisma.gestion.findMany({
      where: {
        negociador: user.email ?? "",
        ...(creditoId ? { creditoId } : {}),
      },
      select: SELECT,
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return NextResponse.json({ data: gestiones.map(serializar) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiRole("negociador")
    const email = user.email ?? ""

    let payload: unknown

    try {
      payload = await request.json()
    } catch {
      throw new ApiError(400, "El cuerpo de la petición no es JSON válido.")
    }

    const parsed = gestionCreateSchema.safeParse(payload)

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Revisa los datos enviados.",
        z.flattenError(parsed.error).fieldErrors
      )
    }

    const { creditoId, ...data } = parsed.data

    const credito = await prisma.credito.findFirst({
      where: { id: creditoId, responsable: email },
      select: { id: true, companiaId: true },
    })

    if (!credito) {
      throw new ApiError(
        403,
        "Ese crédito no está asignado a ti."
      )
    }

    const gestion = await prisma.gestion.create({
      data: {
        ...data,
        creditoId,
        companiaId: credito.companiaId,
        negociador: email,
      },
      select: SELECT,
    })

    return NextResponse.json({ data: serializar(gestion) }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
