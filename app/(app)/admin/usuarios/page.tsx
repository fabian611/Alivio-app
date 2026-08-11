import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { UsuariosTable } from "@/components/usuarios/usuarios-table"
import { requireRole } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { DEFAULT_ROLE, isRole } from "@/lib/roles"
import type { Usuario } from "@/types/usuario"

export const metadata: Metadata = {
  title: "Usuarios",
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireRole("admin")

  const { compania } = await searchParams
  const companiaId = typeof compania === "string" ? compania : undefined

  const [rows, companias] = await Promise.all([
    prisma.user.findMany({
      where: companiaId ? { companiaId } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        cargo: true,
        role: true,
        active: true,
        companiaId: true,
        createdAt: true,
        compania: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.compania.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ])

  const usuarios: Usuario[] = rows.map((row) => ({
    ...row,
    role: isRole(row.role) ? row.role : DEFAULT_ROLE,
    createdAt: row.createdAt.toISOString(),
  }))

  const filtrada = companiaId
    ? companias.find((item) => item.id === companiaId)
    : undefined

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={
          filtrada
            ? `Usuarios de ${filtrada.nombre}.`
            : "Administra los usuarios y la compañía a la que pertenecen."
        }
      />
      <UsuariosTable
        initialData={usuarios}
        companias={companias}
        companiaId={companiaId}
      />
    </>
  )
}
