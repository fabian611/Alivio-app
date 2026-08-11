import type { ApiFieldErrors, Compania } from "@/types/compania"

const ENDPOINT = "/api/companias"

export class CompaniaApiError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: ApiFieldErrors = {}
  ) {
    super(message)
  }
}

async function unwrap(response: Response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new CompaniaApiError(
      payload?.error ?? "No pudimos completar la operación.",
      payload?.details ?? {}
    )
  }

  return payload?.data
}

export async function listCompanias(): Promise<Compania[]> {
  return unwrap(await fetch(ENDPOINT, { cache: "no-store" }))
}

export async function createCompania(body: unknown): Promise<Compania> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

export async function updateCompania(body: unknown): Promise<Compania> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

export async function deleteCompania(id: string): Promise<void> {
  await unwrap(
    await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  )
}
