import type { Usuario } from "@/types/usuario"

const ENDPOINT = "/api/usuarios"

export class UsuarioApiError extends Error {
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
    throw new UsuarioApiError(
      payload?.error ?? "No pudimos completar la operación.",
      payload?.details ?? {}
    )
  }

  return payload?.data
}

export async function listUsuarios(params?: {
  companiaId?: string
  take?: number
}): Promise<Usuario[]> {
  const search = new URLSearchParams()

  if (params?.companiaId) search.set("companiaId", params.companiaId)
  if (params?.take) search.set("take", String(params.take))

  const query = search.toString()

  return unwrap(
    await fetch(query ? `${ENDPOINT}?${query}` : ENDPOINT, {
      cache: "no-store",
    })
  )
}

export async function createUsuario(body: unknown): Promise<Usuario> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

export async function updateUsuario(body: unknown): Promise<Usuario> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

export async function asignarCompania(
  ids: string[],
  companiaId: string | null
): Promise<{ count: number }> {
  return unwrap(
    await fetch(ENDPOINT, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids, companiaId }),
    })
  )
}

export async function deleteUsuario(id: string): Promise<void> {
  await unwrap(
    await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  )
}
