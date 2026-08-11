import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { AplicarReglaView } from "@/components/reglas/aplicar-regla-view"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Tratamientos",
}

export default async function TratamientosPage() {
  const user = await requireRole("gestor")

  const perfil = await prisma.user.findUnique({
    where: { id: user.id },
    select: { companiaId: true },
  })

  if (!perfil?.companiaId) {
    return (
      <>
        <PageHeader
          title="Tratamientos"
          description="Aplica reglas de tratamiento sobre tu cartera."
        />
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tu usuario no tiene una compañía asignada. Pide a un administrador que
          te asigne una.
        </p>
      </>
    )
  }

  const negociadores = await prisma.user.findMany({
    where: {
      role: "negociador",
      companiaId: perfil.companiaId,
      active: true,
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })

  return (
    <>
      <PageHeader
        title="Tratamientos"
        description="Define una condición, revisa qué créditos aplican y asígnalos a tus negociadores."
      />
      <AplicarReglaView negociadores={negociadores} />
    </>
  )
}
