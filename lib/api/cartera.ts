import type { Condiciones } from "@/lib/condiciones"
import type { Credito, PreviewResultado, Regla } from "@/types/credito"

export class CarteraApiError extends Error {
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
    throw new CarteraApiError(
      payload?.error ?? "No pudimos completar la operación.",
      payload?.details ?? {}
    )
  }

  return payload?.data
}

function post(url: string, method: string, body: unknown) {
  return fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function listCreditos(): Promise<Credito[]> {
  return unwrap(await fetch("/api/creditos", { cache: "no-store" }))
}

export async function updateCredito(body: unknown): Promise<{ id: string }> {
  return unwrap(await post("/api/creditos", "PUT", body))
}

export async function listReglas(): Promise<Regla[]> {
  return unwrap(await fetch("/api/reglas", { cache: "no-store" }))
}

export async function createRegla(body: unknown): Promise<Regla> {
  return unwrap(await post("/api/reglas", "POST", body))
}

export async function updateRegla(body: unknown): Promise<Regla> {
  return unwrap(await post("/api/reglas", "PUT", body))
}

export async function deleteRegla(id: string): Promise<void> {
  await unwrap(
    await fetch(`/api/reglas?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  )
}

export async function previewRegla(
  condiciones: Condiciones
): Promise<PreviewResultado> {
  return unwrap(await post("/api/tratamientos", "PUT", { condiciones }))
}

export async function aplicarRegla(
  reglaId: string
): Promise<{ aplicados: number; negociadores: number; regla: string }> {
  return unwrap(await post("/api/tratamientos", "POST", { reglaId }))
}
