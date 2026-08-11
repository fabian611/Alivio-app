import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireCompania } from "@/lib/api-guard"
import {
  condicionesSchema,
  condicionesToWhere,
  describirCondiciones,
} from "@/lib/condiciones"
import { prisma } from "@/lib/prisma"
import { aplicarReglaSchema, previewSchema } from "@/lib/validations/regla"

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

export async function PUT(request: NextRequest) {
  try {
    const { companiaId } = await requireCompania("gestor")
    const { condiciones } = await parseBody(request, previewSchema)

    const where = { companiaId, ...condicionesToWhere(condiciones) }

    const [total, creditos] = await Promise.all([
      prisma.credito.count({ where }),
      prisma.credito.findMany({
        where,
        orderBy: [{ diasMoraAct: "desc" }, { nroCredito: "asc" }],
        take: 500,
      }),
    ])

    return NextResponse.json({
      data: {
        total,
        descripcion: describirCondiciones(condiciones),
        creditos: creditos.map((credito) => ({
          ...credito,
          valorCredito: credito.valorCredito.toString(),
          saldoCapital: credito.saldoCapital.toString(),
          saldoIntereses: credito.saldoIntereses.toString(),
          saldoCuentas: credito.saldoCuentas.toString(),
          cuotaMes: credito.cuotaMes.toString(),
          createdAt: credito.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companiaId, email } = await requireCompania("gestor")
    const { reglaId } = await parseBody(request, aplicarReglaSchema)

    const regla = await prisma.regla.findFirst({
      where: { id: reglaId, companiaId },
    })

    if (!regla) {
      throw new ApiError(404, "La regla no existe.")
    }

    const condiciones = condicionesSchema.parse(regla.condiciones)

    const negociadores = await prisma.user.findMany({
      where: {
        id: { in: regla.responsables },
        role: "negociador",
        companiaId,
        active: true,
      },
      select: { id: true, name: true, email: true },
    })

    if (negociadores.length === 0) {
      throw new ApiError(
        409,
        "La regla no tiene negociadores activos en tu compañía."
      )
    }

    const creditos = await prisma.credito.findMany({
      where: { companiaId, ...condicionesToWhere(condiciones) },
      select: { id: true },
      orderBy: { diasMoraAct: "desc" },
    })

    if (creditos.length === 0) {
      throw new ApiError(409, "Ningún crédito cumple las condiciones.")
    }

    const descripcion = describirCondiciones(condiciones)
    const pool = regla.responsables

    const resultado = await prisma.$transaction(async (tx) => {
      await Promise.all(
        creditos.map((credito, index) => {
          const asignado = negociadores[index % negociadores.length]

          return tx.credito.update({
            where: { id: credito.id },
            data: {
              regla: regla.nombre,
              responsable: asignado.email,
              responsables: pool,
              canal: regla.canal,
              estado: "tratado",
            },
          })
        })
      )

      await tx.tratamiento.createMany({
        data: creditos.map((credito, index) => ({
          creditoId: credito.id,
          companiaId,
          regla: regla.nombre,
          responsable: negociadores[index % negociadores.length].email,
          responsables: pool,
          canal: regla.canal,
          condiciones: descripcion,
          aplicadoPor: email ?? null,
        })),
      })

      return creditos.length
    })

    return NextResponse.json({
      data: {
        aplicados: resultado,
        negociadores: negociadores.length,
        regla: regla.nombre,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
