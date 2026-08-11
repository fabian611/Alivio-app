"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Delete02Icon,
  PencilEdit01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CompaniaDialog } from "@/components/companias/compania-dialog"
import { UsuariosPopover } from "@/components/companias/usuarios-popover"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { useNotification } from "@/components/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  createCompania,
  deleteCompania,
  listCompanias,
  updateCompania,
} from "@/lib/api/companias"
import type { Compania, CompaniaFormValues } from "@/types/compania"

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" })

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—"
}

export function CompaniasTable({ initialData }: { initialData: Compania[] }) {
  const { success, error, confirm } = useNotification()
  const [data, setData] = useState(initialData)
  const [editing, setEditing] = useState<Compania | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refresh = useCallback(async () => {
    setData(await listCompanias())
  }, [])

  const handleSubmit = useCallback(
    async (values: CompaniaFormValues) => {
      const body = { ...values, fechaInicial: values.fechaInicial || null }

      if (editing) {
        await updateCompania({ ...body, id: editing.id })
      } else {
        await createCompania(body)
      }

      await refresh()

      success(
        <>
          {editing ? "Se guardaron los cambios de " : "Se registró la compañía "}
          <strong>{values.nombre}</strong>.
        </>,
        editing ? "Compañía actualizada" : "Compañía creada"
      )
    },
    [editing, refresh, success]
  )

  const askDelete = useCallback(
    (compania: Compania) => {
      confirm({
        type: "warning",
        title: "Eliminar compañía",
        message: (
          <>
            Esta acción no se puede deshacer. Se eliminará{" "}
            <strong>{compania.nombre}</strong> de forma permanente.
          </>
        ),
        confirmLabel: "Eliminar",
        confirmTone: "danger",
        onConfirm: async () => {
          try {
            await deleteCompania(compania.id)
            await refresh()
            success(
              <>
                <strong>{compania.nombre}</strong> ya no está en la lista.
              </>,
              "Compañía eliminada"
            )
          } catch (cause) {
            error(
              cause instanceof Error
                ? cause.message
                : "Ocurrió un error inesperado.",
              "No se pudo eliminar"
            )
          }
        },
      })
    },
    [confirm, error, refresh, success]
  )

  const columns = useMemo<DataTableColumn<Compania>[]>(
    () => [
      { accessorKey: "nombre", header: "Nombre" },
      {
        accessorKey: "nit",
        header: "NIT",
        cell: ({ row }) => row.original.nit ?? "—",
      },
      {
        accessorKey: "nombreCorto",
        header: "Nombre corto",
        cell: ({ row }) => row.original.nombreCorto ?? "—",
      },
      {
        accessorKey: "fechaInicial",
        header: "Fecha inicial",
        cell: ({ row }) => formatDate(row.original.fechaInicial),
      },
      {
        id: "usuarios",
        header: "Usuarios",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{row.original._count.usuarios}</Badge>
            <UsuariosPopover
              companiaId={row.original.id}
              companiaNombre={row.original.nombre}
              total={row.original._count.usuarios}
            />
          </div>
        ),
      },
      {
        id: "acciones",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${row.original.nombre}`}
              onPress={() => {
                setEditing(row.original)
                setDialogOpen(true)
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${row.original.nombre}`}
              onPress={() => askDelete(row.original)}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [askDelete]
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar compañía..."
        emptyMessage="Aún no hay compañías registradas."
        toolbar={
          <Button
            onPress={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Nueva compañía
          </Button>
        }
      />

      <CompaniaDialog
        isOpen={isDialogOpen}
        compania={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
