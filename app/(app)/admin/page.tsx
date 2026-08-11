import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { StatGrid, type Stat } from "@/components/stat-grid"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { ROLES } from "@/lib/roles"

export const metadata: Metadata = {
  title: "Panel de administración",
}

export default async function AdminPage() {
  const user = await requireRole("admin")

  const [total, active, byRole] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
  ])

  const counts = new Map(byRole.map((row) => [row.role, row._count.role]))

  const stats: Stat[] = [
    {
      label: "Usuarios totales",
      value: String(total),
      hint: `${active} activos`,
    },
    ...ROLES.map((role) => ({
      label: `Rol ${role}`,
      value: String(counts.get(role) ?? 0),
      hint: "usuarios asignados",
    })),
  ]

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name ?? "administrador"}`}
        description="Control total de usuarios, roles y configuración de la plataforma."
      />
      <StatGrid stats={stats} />
    </>
  )
}
