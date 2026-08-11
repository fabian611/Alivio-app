import { NextResponse, type NextRequest } from "next/server"
import twilio from "twilio"

export async function POST(request: NextRequest) {
  const from = process.env.TWILIO_FROM
  const destinoPorDefecto = process.env.TWILIO_TEST_TO

  const formulario = await request.formData().catch(() => null)
  const solicitado = formulario?.get("To")

  const destino =
    typeof solicitado === "string" && solicitado.trim()
      ? solicitado.trim()
      : destinoPorDefecto

  const respuesta = new twilio.twiml.VoiceResponse()

  if (!destino || !from) {
    respuesta.say(
      { language: "es-MX" },
      "No hay un número configurado para la llamada."
    )
  } else {
    respuesta.dial({ callerId: from, answerOnBridge: true }, destino)
  }

  return new NextResponse(respuesta.toString(), {
    headers: { "content-type": "text/xml" },
  })
}
