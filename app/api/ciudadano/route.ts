import { NextResponse, type NextRequest } from "next/server"

import { ApiError, handleApiError, requireApiRole } from "@/lib/api-guard"

export const maxDuration = 120

const CONSULTA_POR_DEFECTO = {
  cedula: "38940906",
  fecha_expedicion: "01/02/2024",
  tipo_doc: "CC",
}

export async function POST(request: NextRequest) {
  try {
    await requireApiRole("negociador")

    const endpoint = process.env.API_CUIADAD

    if (!endpoint) {
      throw new ApiError(
        500,
        "Falta configurar API_CUIADAD en las variables de entorno."
      )
    }

    const override = await request.json().catch(() => ({}))
    const payload = { ...CONSULTA_POR_DEFECTO, ...override }

    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(110_000),
    }).catch((cause) => {
      throw new ApiError(
        504,
        cause instanceof Error && cause.name === "TimeoutError"
          ? "La consulta tardó demasiado. Intenta de nuevo."
          : "No pudimos conectar con el servicio de consulta."
      )
    })

    if (!respuesta.ok) {
      throw new ApiError(
        502,
        `El servicio de consulta respondió ${respuesta.status}.`
      )
    }

    const data = await respuesta.json().catch(() => null)

    if (!data) {
      throw new ApiError(502, "El servicio devolvió una respuesta ilegible.")
    }

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}
