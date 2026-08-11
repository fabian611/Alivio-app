import type { Metadata } from "next"

import { BandejaShell } from "@/components/bandeja/bandeja-shell"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import type { Credito } from "@/types/credito"

export const metadata: Metadata = {
  title: "Bandeja de créditos",
}

export default async function BandejaPage() {
  const user = await requireRole("negociador")
  const email = user.email ?? ""

  const [rows, conteos] = await Promise.all([
    prisma.credito.findMany({
      where: { responsable: email },
      orderBy: [{ diasMoraAct: "desc" }, { nroCredito: "asc" }],
    }),
    prisma.gestion.groupBy({
      by: ["creditoId"],
      where: { negociador: email },
      _count: { creditoId: true },
    }),
  ])

  const creditos: Credito[] = rows.map((row) => ({
    ...row,
    valorCredito: row.valorCredito.toString(),
    saldoCapital: row.saldoCapital.toString(),
    saldoIntereses: row.saldoIntereses.toString(),
    saldoCuentas: row.saldoCuentas.toString(),
    cuotaMes: row.cuotaMes.toString(),
    createdAt: row.createdAt.toISOString(),
  }))

  const gestionadosPorCredito = Object.fromEntries(
    conteos.map((fila) => [fila.creditoId, fila._count.creditoId])
  )

  return (
    <BandejaShell
      creditos={creditos}
      gestionadosPorCredito={gestionadosPorCredito}
      usuario={{
        name: user.name ?? email,
        email,
        role: user.role,
      }}
    />
  )
}
