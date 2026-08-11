import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireCompania } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import { idSchema } from "@/lib/validations/id"
import { CANALES } from "@/lib/validations/regla"

const creditoUpdateSchema = z.object({
  id: idSchema("Identificador inválido."),
  responsable: z.string().trim().default(""),
  canal: z.array(z.enum(CANALES)).default([]),
  regla: z.string().trim().max(120).default(""),
  estado: z.enum(["sin_tratar", "tratado"]).default("sin_tratar"),
})

export const CREDITO_SELECT = {
  id: true,
  pagaduria: true,
  nroCredito: true,
  idDeudor: true,
  deudor: true,
  valorCredito: true,
  saldoCapital: true,
  saldoIntereses: true,
  saldoCuentas: true,
  cuotaMes: true,
  cuotasTotal: true,
  diasMoraIni: true,
  diasMoraAct: true,
  estado: true,
  regla: true,
  responsable: true,
  responsables: true,
  canal: true,
  createdAt: true,
} as const

export async function GET() {
  try {
    const { companiaId } = await requireCompania("gestor")

    const creditos = await prisma.credito.findMany({
      where: { companiaId },
      select: CREDITO_SELECT,
      orderBy: [{ diasMoraAct: "desc" }, { nroCredito: "asc" }],
    })

    return NextResponse.json({
      data: creditos.map((credito) => ({
        ...credito,
        valorCredito: credito.valorCredito.toString(),
        saldoCapital: credito.saldoCapital.toString(),
        saldoIntereses: credito.saldoIntereses.toString(),
        saldoCuentas: credito.saldoCuentas.toString(),
        cuotaMes: credito.cuotaMes.toString(),
        createdAt: credito.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { companiaId } = await requireCompania("gestor")

    let payload: unknown

    try {
      payload = await request.json()
    } catch {
      throw new ApiError(400, "El cuerpo de la petición no es JSON válido.")
    }

    const parsed = creditoUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Revisa los datos enviados.",
        z.flattenError(parsed.error).fieldErrors
      )
    }

    const { id, responsable, canal, regla, estado } = parsed.data

    if (responsable) {
      const valido = await prisma.user.count({
        where: {
          email: responsable,
          role: "negociador",
          companiaId,
          active: true,
        },
      })

      if (valido === 0) {
        throw new ApiError(
          422,
          "El responsable debe ser un negociador activo de tu compañía."
        )
      }
    }

    const { count } = await prisma.credito.updateMany({
      where: { id, companiaId },
      data: { responsable, canal, regla, estado },
    })

    if (count === 0) {
      throw new ApiError(404, "El crédito no existe en tu cartera.")
    }

    return NextResponse.json({ data: { id } })
  } catch (error) {
    return handleApiError(error)
  }
}
