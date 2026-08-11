"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CarteraApiError } from "@/lib/api/cartera"
import type { Credito, NegociadorOption, ReglaOption } from "@/types/credito"

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

export type CreditoFormValues = {
  responsable: string
  regla: string
  estado: "sin_tratar" | "tratado"
}

export function CreditoDialog({
  isOpen,
  credito,
  negociadores,
  reglas,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  credito: Credito | null
  negociadores: NegociadorOption[]
  reglas: ReglaOption[]
  onClose: () => void
  onSubmit: (values: CreditoFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<CreditoFormValues>({
    responsable: "",
    regla: "",
    estado: "sin_tratar",
  })
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isOpen && credito) {
      setValues({
        responsable: credito.responsable ?? "",
        regla: credito.regla ?? "",
        estado: credito.estado === "tratado" ? "tratado" : "sin_tratar",
      })
      setMessage(null)
    }
  }, [isOpen, credito])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setMessage(null)

    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      setMessage(
        error instanceof CarteraApiError
          ? error.message
          : "Ocurrió un error inesperado."
      )
    } finally {
      setPending(false)
    }
  }

  const reglaHuerfana =
    values.regla !== "" && !reglas.some((regla) => regla.nombre === values.regla)

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Editar tratamiento</DialogTitle>
        <DialogDescription>
          {credito?.nroCredito} · {credito?.deudor}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="regla">Regla</Label>
          <select
            id="regla"
            className={selectClass}
            value={values.regla}
            onChange={(event) =>
              setValues((current) => ({ ...current, regla: event.target.value }))
            }
          >
            <option value="">Sin regla</option>
            {reglaHuerfana && (
              <option value={values.regla}>{values.regla}</option>
            )}
            {reglas.map((regla) => (
              <option key={regla.id} value={regla.nombre}>
                {regla.nombre}
              </option>
            ))}
          </select>
          {reglas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no has creado reglas. Créalas desde Tratamientos.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="responsable">Responsable</Label>
          <select
            id="responsable"
            className={selectClass}
            value={values.responsable}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                responsable: event.target.value,
              }))
            }
          >
            <option value="">Sin responsable</option>
            {negociadores.map((negociador) => (
              <option key={negociador.id} value={negociador.email}>
                {negociador.name ?? negociador.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            className={selectClass}
            value={values.estado}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                estado: event.target.value as CreditoFormValues["estado"],
              }))
            }
          >
            <option value="sin_tratar">Sin asignar</option>
            <option value="tratado">Asignado</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onPress={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isDisabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
