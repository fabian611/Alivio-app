import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { StatGrid, type Stat } from "@/components/stat-grid"
import { requireRole } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Panel de gestión",
}

const STATS: Stat[] = [
  { label: "Tareas de hoy", value: "9", hint: "3 vencen pronto" },
  { label: "Alertas abiertas", value: "4", hint: "requieren revisión" },
  { label: "Completadas", value: "31", hint: "en los últimos 7 días" },
]

export default async function GestorPage() {
  const user = await requireRole("gestor")

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name ?? "gestor"}`}
        description="Tus tareas asignadas y alertas pendientes."
      />
      <StatGrid stats={STATS} />
    </>
  )
}
