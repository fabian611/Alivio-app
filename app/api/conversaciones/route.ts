import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"
import { prisma } from "@/lib/prisma"
import { enviarMensaje } from "@/lib/twilio"
import { idSchema } from "@/lib/validations/id"

const MENSAJES_SELECT = {
  id: true,
  direccion: true,
  cuerpo: true,
  estado: true,
  errorMensaje: true,
  enviadoPor: true,
  createdAt: true,
} as const

function serializar(conversacion: {
  id: string
  telefono: string
  ventanaExpiraAt: Date | null
  ultimoMensajeAt: Date | null
  mensajes: { createdAt: Date }[]
}) {
  return {
    ...conversacion,
    ventanaExpiraAt: conversacion.ventanaExpiraAt?.toISOString() ?? null,
    ultimoMensajeAt: conversacion.ultimoMensajeAt?.toISOString() ?? null,
    ventanaAbierta:
      conversacion.ventanaExpiraAt !== null &&
      conversacion.ventanaExpiraAt.getTime() > Date.now(),
    mensajes: conversacion.mensajes.map((mensaje) => ({
      ...mensaje,
      createdAt: mensaje.createdAt.toISOString(),
    })),
  }
}

async function creditoDelNegociador(creditoId: string, email: string) {
  const credito = await prisma.credito.findFirst({
    where: { id: creditoId, responsable: email },
    select: { id: true, companiaId: true, telefono: true, deudor: true },
  })

  if (!credito) {
    throw new ApiError(403, "Ese crédito no está asignado a ti.")
  }

  return credito
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiRole("negociador")
    const email = user.email ?? ""

    const creditoId = request.nextUrl.searchParams.get("creditoId")
    const parsed = idSchema("Crédito inválido.").safeParse(creditoId)

    if (!parsed.success) {
      throw new ApiError(400, "Debes indicar el crédito.")
    }

    await creditoDelNegociador(parsed.data, email)

    const conversacion = await prisma.conversacion.findFirst({
      where: { creditoId: parsed.data, canal: "whatsapp" },
      select: {
        id: true,
        telefono: true,
        ventanaExpiraAt: true,
        ultimoMensajeAt: true,
        mensajes: {
          select: MENSAJES_SELECT,
          orderBy: { createdAt: "asc" },
          take: 200,
        },
      },
    })

    return NextResponse.json({
      data: conversacion ? serializar(conversacion) : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

const envioSchema = z.object({
  creditoId: idSchema("Crédito inválido."),
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

    const parsed = envioSchema.safeParse(payload)

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Revisa los datos enviados.",
        z.flattenError(parsed.error).fieldErrors
      )
    }

    const { creditoId, cuerpo } = parsed.data
    const credito = await creditoDelNegociador(creditoId, email)

    const telefono =
      credito.telefono ?? process.env.TWILIO_WHATSAPP_TO ?? null

    if (!telefono) {
      throw new ApiError(
        409,
        "El crédito no tiene teléfono registrado y no hay número de prueba configurado."
      )
    }

    const conversacion = await prisma.conversacion.upsert({
      where: {
        creditoId_telefono_canal: {
          creditoId,
          telefono,
          canal: "whatsapp",
        },
      },
      update: {},
      create: {
        creditoId,
        companiaId: credito.companiaId,
        telefono,
        canal: "whatsapp",
      },
      select: { id: true },
    })

    const resultado = await enviarMensaje({
      cuerpo,
      canal: "whatsapp",
      destino: telefono,
    })

    const mensaje = await prisma.mensaje.create({
      data: {
        conversacionId: conversacion.id,
        direccion: "out",
        cuerpo,
        twilioSid: resultado.sid,
        estado: resultado.status,
        enviadoPor: email,
      },
      select: MENSAJES_SELECT,
    })

    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: { ultimoMensajeAt: new Date() },
    })

    return NextResponse.json({
      data: { ...mensaje, createdAt: mensaje.createdAt.toISOString() },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
