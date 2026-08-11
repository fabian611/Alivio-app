import type { Gestion } from "@/types/gestion"

const ENDPOINT = "/api/gestiones"

export class GestionApiError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string[]> = {}
  ) {
    super(message)
  }
}

async function unwrap(response: Response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new GestionApiError(
      payload?.error ?? "No pudimos completar la operación.",
      payload?.details ?? {}
    )
  }

  return payload?.data
}

export async function listGestiones(creditoId?: string): Promise<Gestion[]> {
  const query = creditoId
    ? `?creditoId=${encodeURIComponent(creditoId)}`
    : ""

  return unwrap(await fetch(`${ENDPOINT}${query}`, { cache: "no-store" }))
}

export async function createGestion(body: unknown): Promise<Gestion> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}
