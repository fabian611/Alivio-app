import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { StatGrid, type Stat } from "@/components/stat-grid"
import { requireRole } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Panel de negociación",
}

const STATS: Stat[] = [
  { label: "Cartera asignada", value: "128", hint: "casos en tu bandeja" },
  { label: "Acuerdos del mes", value: "23", hint: "18 al corriente" },
  { label: "Meta de recaudo", value: "74%", hint: "cierre de mes" },
]

export default async function NegociadorPage() {
  const user = await requireRole("negociador")

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name ?? "negociador"}`}
        description="Tu cartera, acuerdos y seguimiento de negociaciones."
      />
      <StatGrid stats={STATS} />
    </>
  )
}
