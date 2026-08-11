"use client"

import { useEffect, useState } from "react"
import {
  flexRender,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type DataTableColumn<TData extends RowData> = LegacyColumnDef<
  TData,
  unknown
>

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  pageSize = 10,
  toolbar,
  getRowId,
  onSelectionChange,
  selectionBar,
  selectionResetKey = 0,
}: {
  columns: DataTableColumn<TData>[]
  data: TData[]
  searchPlaceholder?: string
  emptyMessage?: string
  pageSize?: number
  toolbar?: React.ReactNode
  getRowId?: (row: TData) => string
  onSelectionChange?: (rows: TData[]) => void
  selectionBar?: React.ReactNode
  selectionResetKey?: number
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selectable = Boolean(getRowId)

  const table = useLegacyTable({
    data,
    columns,
    getRowId,
    enableRowSelection: selectable,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  useEffect(() => {
    setRowSelection({})
  }, [selectionResetKey])

  useEffect(() => {
    onSelectionChange?.(selectedRows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, data])

  const rows = table.getRowModel().rows
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior: Buscador y Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="sm:max-w-xs"
        />
        {toolbar}
      </div>

      {selectable && selectedRows.length > 0 && selectionBar && (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium">
            {selectedRows.length} seleccionado(s)
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {selectionBar}
            <Button
              variant="ghost"
              size="sm"
              onPress={() => table.resetRowSelection()}
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla de datos */}
      <div className="relative w-full overflow-x-auto rounded-lg border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {selectable && (
                  <th className="w-10 px-2">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todo"
                      className="size-4 accent-primary"
                      checked={table.getIsAllPageRowsSelected()}
                      ref={(node) => {
                        if (node) {
                          node.indeterminate =
                            table.getIsSomePageRowsSelected() &&
                            !table.getIsAllPageRowsSelected()
                        }
                      }}
                      onChange={(event) =>
                        table.toggleAllPageRowsSelected(event.target.checked)
                      }
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()

                  return (
                    <th
                      key={header.id}
                      className="h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-label={`Ordenar por ${header.column.columnDef.header}`}
                          className="inline-flex items-center gap-1 transition hover:text-foreground/70"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted && (
                            <HugeiconsIcon
                              icon={
                                sorted === "asc"
                                  ? ArrowUp01Icon
                                  : ArrowDown01Icon
                              }
                              size={14}
                            />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="[&_tr:last-child]:border-0">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-selected={row.getIsSelected() || undefined}
                  className="border-b transition-colors hover:bg-muted/50 data-selected:bg-muted/60"
                >
                  {selectable && (
                    <td className="w-10 px-2">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar fila"
                        className="size-4 accent-primary"
                        checked={row.getIsSelected()}
                        onChange={(event) =>
                          row.toggleSelected(event.target.checked)
                        }
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-2 align-middle whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación inferior: Selector de filas y controles numéricos con < y > */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Página {pageIndex + 1} de {pageCount || 1}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size} className="bg-popover text-popover-foreground">
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            isDisabled={!table.getCanPreviousPage()}
            onPress={() => table.previousPage()}
            aria-label="Página anterior"
          >
            &lt;
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {Array.from({ length: pageCount }, (_, i) => i).map((page) => (
              <Button
                key={page}
                variant={pageIndex === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onPress={() => table.setPageIndex(page)}
              >
                {page + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            isDisabled={!table.getCanNextPage()}
            onPress={() => table.nextPage()}
            aria-label="Página siguiente"
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  )
}