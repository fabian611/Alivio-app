import type { Metadata } from "next"

import { HistorialTable } from "@/components/bandeja/historial-table"
import { PageHeader } from "@/components/page-header"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import type { Gestion } from "@/types/gestion"

export const metadata: Metadata = {
  title: "Historial",
}

export default async function HistorialPage() {
  const user = await requireRole("negociador")
  const email = user.email ?? ""

  const rows = await prisma.gestion.findMany({
    where: { negociador: email },
    include: {
      credito: {
        select: { nroCredito: true, deudor: true, pagaduria: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  })

  const gestiones = rows.map((row) => ({
    ...row,
    fechaCompromiso: row.fechaCompromiso?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  })) as Gestion[]

  return (
    <>
      <PageHeader
        title="Historial de gestiones"
        description={`${gestiones.length} gestión(es) registradas.`}
      />
      <HistorialTable gestiones={gestiones} />
    </>
  )
}
