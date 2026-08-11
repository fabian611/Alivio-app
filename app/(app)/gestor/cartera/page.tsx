import type { Metadata } from "next"

import { CarteraView } from "@/components/creditos/cartera-view"
import { PageHeader } from "@/components/page-header"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import type { Credito } from "@/types/credito"

export const metadata: Metadata = {
  title: "Cartera",
}

export default async function CarteraPage() {
  const user = await requireRole("gestor")

  const perfil = await prisma.user.findUnique({
    where: { id: user.id },
    select: { companiaId: true, compania: { select: { nombre: true } } },
  })

  if (!perfil?.companiaId) {
    return (
      <>
        <PageHeader
          title="Visualizar Cartera"
          description="Créditos asignados a tu compañía."
        />
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tu usuario no tiene una compañía asignada, así que no hay cartera que
          mostrar. Pide a un administrador que te asigne una.
        </p>
      </>
    )
  }

  const [rows, negociadores, reglas] = await Promise.all([
    prisma.credito.findMany({
      where: { companiaId: perfil.companiaId },
      orderBy: [{ diasMoraAct: "desc" }, { nroCredito: "asc" }],
    }),
    prisma.user.findMany({
      where: {
        role: "negociador",
        companiaId: perfil.companiaId,
        active: true,
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.regla.findMany({
      where: { companiaId: perfil.companiaId, activa: true },
      select: { id: true, nombre: true },
      orderBy: { createdAt: "desc" },
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

  return (
    <>
      <PageHeader
        title="Visualizar Cartera"
        description={`Créditos de ${perfil.compania?.nombre ?? "tu compañía"}.`}
      />
      <CarteraView
        initialData={creditos}
        negociadores={negociadores}
        reglas={reglas}
      />
    </>
  )
}
