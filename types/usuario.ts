import type { Role } from "@/lib/roles"

export type Usuario = {
  id: string
  name: string | null
  email: string
  cargo: string | null
  role: Role
  active: boolean
  companiaId: string | null
  compania: { id: string; nombre: string } | null
  createdAt: string
}

export type UsuarioFormValues = {
  name: string
  email: string
  password: string
  cargo: string
  role: Role
  companiaId: string
  active: boolean
}

export type UsuarioFieldErrors = Partial<
  Record<keyof UsuarioFormValues, string[]>
>

export type CompaniaOption = {
  id: string
  nombre: string
}
