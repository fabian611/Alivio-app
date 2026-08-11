"use client"

import { useMemo } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import {
  NEGOCIACION_LABEL,
  SUBACCION_LABEL,
  TIPO_CONTACTO_LABEL,
} from "@/lib/gestion"
import type { Gestion } from "@/types/gestion"

const fecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
})

const soloFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" })

export function HistorialTable({ gestiones }: { gestiones: Gestion[] }) {
  const columns = useMemo<DataTableColumn<Gestion>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">
            {fecha.format(new Date(row.original.createdAt))}
          </span>
        ),
      },
      {
        id: "credito",
        header: "Crédito",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.credito.nroCredito ?? "—"}
          </span>
        ),
      },
      {
        id: "deudor",
        header: "Deudor",
        cell: ({ row }) => row.original.credito.deudor ?? "—",
      },
      {
        accessorKey: "tipoContacto",
        header: "Contacto",
        cell: ({ row }) => (
          <Badge variant="outline">
            {TIPO_CONTACTO_LABEL[row.original.tipoContacto]}
          </Badge>
        ),
      },
      {
        accessorKey: "negociacion",
        header: "Negociación",
        cell: ({ row }) => NEGOCIACION_LABEL[row.original.negociacion],
      },
      {
        accessorKey: "subaccion",
        header: "Detalle",
        cell: ({ row }) =>
          row.original.subaccion
            ? SUBACCION_LABEL[row.original.subaccion]
            : "—",
      },
      {
        accessorKey: "fechaCompromiso",
        header: "Compromiso",
        cell: ({ row }) =>
          row.original.fechaCompromiso
            ? soloFecha.format(new Date(row.original.fechaCompromiso))
            : "—",
      },
      {
        accessorKey: "compromisoCliente",
        header: "Nota",
        cell: ({ row }) => (
          <span className="block max-w-56 truncate text-xs text-muted-foreground">
            {row.original.compromisoCliente ?? "—"}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <DataTable
      columns={columns}
      data={gestiones}
      searchPlaceholder="Buscar en el historial..."
      emptyMessage="Aún no has registrado gestiones."
      pageSize={20}
    />
  )
}
