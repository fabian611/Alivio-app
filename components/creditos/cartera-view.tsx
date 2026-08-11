"use client"

import { useCallback, useState } from "react"

import {
  CreditoDialog,
  type CreditoFormValues,
} from "@/components/creditos/credito-dialog"
import { CreditosTable } from "@/components/creditos/creditos-table"
import { useNotification } from "@/components/notification-provider"
import { listCreditos, updateCredito } from "@/lib/api/cartera"
import type {
  Credito,
  NegociadorOption,
  ReglaOption,
} from "@/types/credito"

export function CarteraView({
  initialData,
  negociadores,
  reglas,
}: {
  initialData: Credito[]
  negociadores: NegociadorOption[]
  reglas: ReglaOption[]
}) {
  const { success, error } = useNotification()
  const [creditos, setCreditos] = useState(initialData)
  const [editing, setEditing] = useState<Credito | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleEdit = useCallback((credito: Credito) => {
    setEditing(credito)
    setDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (values: CreditoFormValues) => {
      if (!editing) return

      await updateCredito({ ...values, canal: editing.canal, id: editing.id })
      setCreditos(await listCreditos())

      success(
        <>
          Se actualizó el tratamiento de{" "}
          <strong>{editing.nroCredito ?? editing.id}</strong>.
        </>,
        "Crédito actualizado"
      )
    },
    [editing, success]
  )

  return (
    <>
      <CreditosTable creditos={creditos} onEdit={handleEdit} />

      <CreditoDialog
        isOpen={isDialogOpen}
        credito={editing}
        negociadores={negociadores}
        reglas={reglas}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
