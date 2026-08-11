import { NextResponse } from "next/server"
import twilio from "twilio"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"

export async function GET() {
  try {
    const user = await requireApiRole("negociador")

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const apiKeySid = process.env.TWILIO_API_KEY_SID
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      throw new ApiError(
        500,
        "Faltan TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET o TWILIO_TWIML_APP_SID."
      )
    }

    const { AccessToken } = twilio.jwt
    const { VoiceGrant } = AccessToken

    const identidad = (user.email ?? "negociador").replace(/[^a-zA-Z0-9_.-]/g, "_")

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: identidad,
      ttl: 3600,
    })

    token.addGrant(
      new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: false,
      })
    )

    return NextResponse.json({
      data: { token: token.toJwt(), identity: identidad },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
