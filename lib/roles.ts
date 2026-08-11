export const ROLES = ["admin", "negociador", "gestor"] as const

export type Role = (typeof ROLES)[number]

export const DEFAULT_ROLE: Role = "gestor"

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  negociador: "Negociador",
  gestor: "Gestor",
}

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  negociador: "/negociador",
  gestor: "/gestor",
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role)
}

export function homeFor(role: Role): string {
  return ROLE_HOME[role]
}

export function ownerOf(pathname: string): Role | null {
  return (
    ROLES.find((role) => {
      const base = ROLE_HOME[role]
      return pathname === base || pathname.startsWith(`${base}/`)
    }) ?? null
  )
}

export function canAccess(role: Role, pathname: string): boolean {
  const owner = ownerOf(pathname)
  return owner === null || owner === role
}
