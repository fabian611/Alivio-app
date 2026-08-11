import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"

const VENTANA_HORAS = 24

function normalizar(numero: string) {
  return numero.replace(/^whatsapp:/, "").trim()
}

export async function POST(request: NextRequest) {
  const formulario = await request.formData().catch(() => null)

  if (!formulario) {
    return new NextResponse("<Response/>", {
      headers: { "content-type": "text/xml" },
    })
  }

  const messageSid = String(formulario.get("MessageSid") ?? "")
  const messageStatus = String(formulario.get("MessageStatus") ?? "")
  const cuerpo = String(formulario.get("Body") ?? "")
  const desde = normalizar(String(formulario.get("From") ?? ""))

  try {
    if (messageStatus && !cuerpo) {
      await prisma.mensaje.updateMany({
        where: { twilioSid: messageSid },
        data: {
          estado: messageStatus,
          errorMensaje: (formulario.get("ErrorMessage") as string) || null,
        },
      })

      return new NextResponse("<Response/>", {
        headers: { "content-type": "text/xml" },
      })
    }

    if (!desde || !cuerpo) {
      return new NextResponse("<Response/>", {
        headers: { "content-type": "text/xml" },
      })
    }

    const conversacion = await prisma.conversacion.findFirst({
      where: { telefono: desde, canal: "whatsapp" },
      orderBy: { ultimoMensajeAt: "desc" },
      select: { id: true },
    })

    if (!conversacion) {
      console.warn(`WhatsApp entrante sin conversación previa: ${desde}`)

      return new NextResponse("<Response/>", {
        headers: { "content-type": "text/xml" },
      })
    }

    const ahora = new Date()

    await prisma.$transaction([
      prisma.mensaje.create({
        data: {
          conversacionId: conversacion.id,
          direccion: "in",
          cuerpo,
          twilioSid: messageSid || null,
          estado: "received",
        },
      }),
      prisma.conversacion.update({
        where: { id: conversacion.id },
        data: {
          ultimoMensajeAt: ahora,
          ventanaExpiraAt: new Date(
            ahora.getTime() + VENTANA_HORAS * 60 * 60 * 1000
          ),
        },
      }),
    ])
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:", error)
  }

  return new NextResponse("<Response/>", {
    headers: { "content-type": "text/xml" },
  })
}
