import type { Metadata } from "next"

import { CompaniasTable } from "@/components/companias/companias-table"
import { PageHeader } from "@/components/page-header"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import type { Compania } from "@/types/compania"

export const metadata: Metadata = {
  title: "Compañías",
}

export default async function CompaniasPage() {
  await requireRole("admin")

  const rows = await prisma.compania.findMany({
    select: {
      id: true,
      nit: true,
      nombre: true,
      nombreCorto: true,
      fechaInicial: true,
      urlCargue: true,
      createdAt: true,
      _count: { select: { usuarios: true } },
    },
    orderBy: { nombre: "asc" },
  })

  const companias: Compania[] = rows.map((row) => ({
    ...row,
    fechaInicial: row.fechaInicial?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }))

  return (
    <>
      <PageHeader
        title="Compañías"
        description="Administra las compañías y sus usuarios asociados."
      />
      <CompaniasTable initialData={companias} />
    </>
  )
}
