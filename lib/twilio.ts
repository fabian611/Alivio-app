import "server-only"

import { ApiError } from "@/lib/api-guard"

const API_BASE = "https://api.twilio.com/2010-04-01/Accounts"

export type CanalMensaje = "sms" | "whatsapp"

function credenciales() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM
  const to = process.env.TWILIO_TEST_TO

  if (!accountSid || !authToken || !from || !to) {
    throw new ApiError(
      500,
      "Faltan credenciales de Twilio. Configura TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM y TWILIO_TEST_TO."
    )
  }

  return { accountSid, authToken, from, to }
}

export async function enviarMensaje({
  cuerpo,
  canal = "sms",
  destino,
}: {
  cuerpo: string
  canal?: CanalMensaje
  destino?: string
}) {
  const { accountSid, authToken, from, to } = credenciales()

  const esWhatsapp = canal === "whatsapp"

  const remitente = esWhatsapp
    ? process.env.TWILIO_WHATSAPP_FROM ?? from
    : from
  const destinatario =
    destino ??
    (esWhatsapp ? process.env.TWILIO_WHATSAPP_TO ?? to : to)

  const prefijo = esWhatsapp ? "whatsapp:" : ""

  const body = new URLSearchParams({
    To: `${prefijo}${destinatario}`,
    From: `${prefijo}${remitente}`,
    Body: cuerpo,
  })

  const baseUrl = process.env.APP_PUBLIC_URL

  if (baseUrl) {
    body.set(
      "StatusCallback",
      `${baseUrl.replace(/\/$/, "")}/api/webhooks/twilio/whatsapp`
    )
  }

  const respuesta = await fetch(
    `${API_BASE}/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(
          `${accountSid}:${authToken}`
        ).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(30_000),
    }
  ).catch(() => {
    throw new ApiError(504, "No pudimos conectar con Twilio.")
  })

  const payload = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status === 401 ? 500 : 502,
      payload?.message
        ? `Twilio: ${payload.message}`
        : `Twilio respondió ${respuesta.status}.`
    )
  }

  return {
    sid: payload?.sid as string,
    status: payload?.status as string,
    to: payload?.to as string,
  }
}

const STUDIO_BASE = "https://studio.twilio.com/v2/Flows"

export async function iniciarLlamadaIVR({
  parametros = {},
}: {
  parametros?: Record<string, string | number | null>
} = {}) {
  const { accountSid, authToken, from, to } = credenciales()
  const flowSid = process.env.TWILIO_FLOW_SID

  if (!flowSid) {
    throw new ApiError(
      500,
      "Falta configurar TWILIO_FLOW_SID con el Studio Flow del IVR."
    )
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Parameters: JSON.stringify(parametros),
  })

  const respuesta = await fetch(`${STUDIO_BASE}/${flowSid}/Executions`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(
        `${accountSid}:${authToken}`
      ).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => {
    throw new ApiError(504, "No pudimos conectar con Twilio Studio.")
  })

  const payload = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status === 401 ? 500 : 502,
      payload?.message
        ? `Twilio: ${payload.message}`
        : `Twilio Studio respondió ${respuesta.status}.`
    )
  }

  return {
    sid: payload?.sid as string,
    status: payload?.status as string,
    to: payload?.contact_channel_address as string,
  }
}
