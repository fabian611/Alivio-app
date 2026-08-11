import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import { enviarMensaje } from "@/lib/twilio"
import { idSchema } from "@/lib/validations/id"

const mensajeSchema = z.object({
  creditoId: idSchema("Crédito inválido."),
  canal: z.enum(["sms", "whatsapp"]).default("sms"),
  cuerpo: z
    .string()
    .trim()
    .min(1, "Escribe el mensaje.")
    .max(1600, "Máximo 1600 caracteres."),
})

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

    const parsed = mensajeSchema.safeParse(payload)

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Revisa los datos enviados.",
        z.flattenError(parsed.error).fieldErrors
      )
    }

    const { creditoId, canal, cuerpo } = parsed.data

    const credito = await prisma.credito.findFirst({
      where: { id: creditoId, responsable: email },
      select: { id: true },
    })

    if (!credito) {
      throw new ApiError(403, "Ese crédito no está asignado a ti.")
    }

    const resultado = await enviarMensaje({ cuerpo, canal })

    return NextResponse.json({ data: resultado })
  } catch (error) {
    return handleApiError(error)
  }
}
