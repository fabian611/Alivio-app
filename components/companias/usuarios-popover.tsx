"use client"

import { useState } from "react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, LinkButton } from "@/components/ui/button"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { listUsuarios } from "@/lib/api/usuarios"
import { ROLE_LABEL } from "@/lib/roles"
import type { Usuario } from "@/types/usuario"

const PREVIEW_SIZE = 4

export function UsuariosPopover({
  companiaId,
  companiaNombre,
  total,
}: {
  companiaId: string
  companiaNombre: string
  total: number
}) {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleOpenChange(open: boolean) {
    if (!open) return

    setError(null)
    setUsuarios(null)

    try {
      setUsuarios(await listUsuarios({ companiaId, take: PREVIEW_SIZE }))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No pudimos cargar los usuarios."
      )
    }
  }

  return (
    <PopoverTrigger onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="icon-xs"
        aria-label={`Ver usuarios de ${companiaNombre}`}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
      </Button>

      <Popover placement="bottom end" className="w-96 gap-0 p-0">
        <p className="border-b px-3 py-2 text-xs text-muted-foreground">
          Usuarios de <span className="text-foreground">{companiaNombre}</span>
        </p>

        <div className="max-h-56 overflow-y-auto">
          {error ? (
            <p className="px-3 py-6 text-center text-xs text-destructive">
              {error}
            </p>
          ) : usuarios === null ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Cargando...
            </p>
          ) : usuarios.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Esta compañía no tiene usuarios.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-1.5 text-start font-normal">nombre</th>
                  <th className="px-3 py-1.5 text-start font-normal">correo</th>
                  <th className="px-3 py-1.5 text-start font-normal">rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b last:border-0">
                    <td className="max-w-28 truncate px-3 py-1.5">
                      {usuario.name ?? "—"}
                    </td>
                    <td className="max-w-36 truncate px-3 py-1.5 text-muted-foreground">
                      {usuario.email}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {ROLE_LABEL[usuario.role]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {total > PREVIEW_SIZE
              ? `Mostrando ${PREVIEW_SIZE} de ${total}`
              : `${total} usuario(s)`}
          </span>
          <LinkButton
            variant="outline"
            size="xs"
            href={`/admin/usuarios?compania=${companiaId}`}
          >
            Abrir tabla
          </LinkButton>
        </div>
      </Popover>
    </PopoverTrigger>
  )
}
