"use client"

import { useMemo } from "react"
import { PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CANAL_LABEL, type Canal } from "@/lib/validations/regla"
import type { Credito } from "@/types/credito"

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

function formatMoney(value: string) {
  return money.format(Number(value))
}

function moraTone(dias: number) {
  if (dias === 0) return "bg-emerald-500/10 text-emerald-600"
  if (dias <= 30) return "bg-amber-500/10 text-amber-600"
  if (dias <= 90) return "bg-orange-500/10 text-orange-600"
  return "bg-red-500/10 text-red-600"
}

export function CreditosTable({
  creditos,
  toolbar,
  onEdit,
}: {
  creditos: Credito[]
  toolbar?: React.ReactNode
  onEdit?: (credito: Credito) => void
}) {
  const columns = useMemo<DataTableColumn<Credito>[]>(
    () => [
      {
        accessorKey: "pagaduria",
        header: "Pagaduría",
        cell: ({ row }) => row.original.pagaduria ?? "—",
      },
      {
        accessorKey: "nroCredito",
        header: "Nro Crédito",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.nroCredito ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "deudor",
        header: "Deudor",
        cell: ({ row }) => row.original.deudor ?? "—",
      },
      {
        accessorKey: "saldoCapital",
        header: "Capital",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.saldoCapital)}
          </span>
        ),
      },
      {
        accessorKey: "diasMoraAct",
        header: "Mora Act",
        cell: ({ row }) => (
          <Badge className={moraTone(row.original.diasMoraAct)}>
            {row.original.diasMoraAct} días
          </Badge>
        ),
      },
      {
        accessorKey: "estado",
        header: "Tratamiento",
        cell: ({ row }) => {
          const sinAsignar = row.original.estado === "sin_tratar"

          return (
            <Badge
              className={
                sinAsignar
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-green-500/20 bg-green-500/10 text-green-600"
              }
            >
              {sinAsignar ? "Sin asignar" : "Asignado"}
            </Badge>
          )
        },
      },
      {
        id: "canal",
        header: "Canal",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.canal.length === 0 ? (
            "—"
          ) : (
            <div className="flex flex-wrap gap-1">
              {row.original.canal.map((canal) => (
                <Badge key={canal} variant="outline" className="text-[10px]">
                  {CANAL_LABEL[canal as Canal] ?? canal}
                </Badge>
              ))}
            </div>
          ),
      },
      {
        accessorKey: "responsable",
        header: "Responsable",
        cell: ({ row }) => row.original.responsable || "—",
      },
      {
        accessorKey: "regla",
        header: "Regla",
        cell: ({ row }) => row.original.regla || "—",
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) =>
          onEdit ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar tratamiento de ${row.original.nroCredito}`}
              onPress={() => onEdit(row.original)}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [onEdit]
  )

  return (
    <DataTable
      columns={columns}
      data={creditos}
      searchPlaceholder="Buscar por deudor, crédito o pagaduría..."
      emptyMessage="No hay créditos en la cartera de tu compañía."
      pageSize={20}
      toolbar={toolbar}
    />
  )
}
