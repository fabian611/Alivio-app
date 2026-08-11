"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Delete02Icon,
  PencilEdit01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { useNotification } from "@/components/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog"
import {
  asignarCompania,
  createUsuario,
  deleteUsuario,
  listUsuarios,
  updateUsuario,
} from "@/lib/api/usuarios"
import { ROLE_LABEL } from "@/lib/roles"
import type {
  CompaniaOption,
  Usuario,
  UsuarioFormValues,
} from "@/types/usuario"

export function UsuariosTable({
  initialData,
  companias,
  companiaId,
}: {
  initialData: Usuario[]
  companias: CompaniaOption[]
  companiaId?: string
}) {
  const { success, error, confirm } = useNotification()
  const [data, setData] = useState(initialData)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Usuario[]>([])
  const [bulkCompaniaId, setBulkCompaniaId] = useState("")
  const [bulkPending, setBulkPending] = useState(false)
  const [selectionResetKey, setSelectionResetKey] = useState(0)

  const clearSelection = useCallback(() => {
    setSelectionResetKey((key) => key + 1)
    setBulkCompaniaId("")
  }, [])

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refresh = useCallback(async () => {
    setData(await listUsuarios(companiaId ? { companiaId } : undefined))
  }, [companiaId])

  const handleSubmit = useCallback(
    async (values: UsuarioFormValues) => {
      const body = {
        ...values,
        companiaId: values.companiaId || null,
      }

      if (editing) {
        await updateUsuario({ ...body, id: editing.id })
      } else {
        await createUsuario(body)
      }

      await refresh()

      success(
        <>
          {editing ? "Se guardaron los cambios de " : "Se creó el usuario "}
          <strong>{values.name}</strong>.
        </>,
        editing ? "Usuario actualizado" : "Usuario creado"
      )
    },
    [editing, refresh, success]
  )

  const askDelete = useCallback(
    (usuario: Usuario) => {
      confirm({
        type: "warning",
        title: "Eliminar usuario",
        message: (
          <>
            Esta acción no se puede deshacer. Se eliminará{" "}
            <strong>{usuario.name ?? usuario.email}</strong> de forma permanente.
          </>
        ),
        confirmLabel: "Eliminar",
        confirmTone: "danger",
        onConfirm: async () => {
          try {
            await deleteUsuario(usuario.id)
            await refresh()
            clearSelection()
            success(
              <>
                <strong>{usuario.name ?? usuario.email}</strong> ya no está en la
                lista.
              </>,
              "Usuario eliminado"
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
    [clearSelection, confirm, error, refresh, success]
  )

  const handleAsignar = useCallback(async () => {
    setBulkPending(true)

    try {
      const ids = selected.map((usuario) => usuario.id)
      const { count } = await asignarCompania(ids, bulkCompaniaId || null)
      await refresh()

      const destino = companias.find((item) => item.id === bulkCompaniaId)

      clearSelection()

      success(
        <>
          Se {count === 1 ? "asignó" : "asignaron"} <strong>{count}</strong>{" "}
          usuario(s) a{" "}
          <strong>{destino ? destino.nombre : "ninguna compañía"}</strong>.
        </>,
        "Compañía asignada"
      )
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        "No se pudo asignar"
      )
    } finally {
      setBulkPending(false)
    }
  }, [
    bulkCompaniaId,
    clearSelection,
    companias,
    error,
    refresh,
    selected,
    success,
  ])

  const columns = useMemo<DataTableColumn<Usuario>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => row.original.name ?? "—",
      },
      { accessorKey: "email", header: "Correo" },
      {
        accessorKey: "cargo",
        header: "Cargo",
        cell: ({ row }) => row.original.cargo ?? "—",
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => ROLE_LABEL[row.original.role],
      },
      {
        id: "compania",
        header: "Compañía",
        cell: ({ row }) => row.original.compania?.nombre ?? "—",
      },
      {
        accessorKey: "active",
        header: "Estado",
        cell: ({ row }) => {
          const isActive = row.original.active

          return (
            <Badge
              className={
                isActive
                  ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" // Verde para activo
                  : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"         // Rojo para inactivo
              }
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          )
        },
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
              aria-label={`Editar ${row.original.email}`}
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
              aria-label={`Eliminar ${row.original.email}`}
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
        searchPlaceholder="Buscar usuario..."
        emptyMessage="No hay usuarios para mostrar."
        getRowId={(usuario) => usuario.id}
        onSelectionChange={setSelected}
        selectionResetKey={selectionResetKey}
        selectionBar={
          <>
            <select
              aria-label="Compañía a asignar"
              value={bulkCompaniaId}
              onChange={(event) => setBulkCompaniaId(event.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Sin compañía</option>
              {companias.map((compania) => (
                <option key={compania.id} value={compania.id}>
                  {compania.nombre}
                </option>
              ))}
            </select>
            <Button size="sm" isDisabled={bulkPending} onPress={handleAsignar}>
              {bulkPending ? "Asignando..." : "Asignar compañía"}
            </Button>
          </>
        }
        toolbar={
          <Button
            onPress={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Nuevo usuario
          </Button>
        }
      />

      <UsuarioDialog
        isOpen={isDialogOpen}
        usuario={editing}
        companias={companias}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
