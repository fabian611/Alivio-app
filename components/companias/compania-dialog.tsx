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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompaniaApiError } from "@/lib/api/companias"
import type {
  ApiFieldErrors,
  Compania,
  CompaniaFormValues,
} from "@/types/compania"

const EMPTY: CompaniaFormValues = {
  nit: "",
  nombre: "",
  nombreCorto: "",
  fechaInicial: "",
  urlCargue: "",
}

const FIELDS: {
  name: keyof CompaniaFormValues
  label: string
  type?: string
  placeholder?: string
}[] = [
  { name: "nombre", label: "Nombre", placeholder: "Razón social" },
  { name: "nit", label: "NIT", placeholder: "Solo números (ej: 900123456)" },
  { name: "nombreCorto", label: "Nombre corto", placeholder: "Sigla" },
  { name: "fechaInicial", label: "Fecha inicial", type: "date" },
  {
    name: "urlCargue",
    label: "URL de cargue",
    placeholder: "https://...",
  },
]

function toFormValues(compania: Compania | null): CompaniaFormValues {
  if (!compania) return EMPTY

  return {
    nit: compania.nit ?? "",
    nombre: compania.nombre,
    nombreCorto: compania.nombreCorto ?? "",
    fechaInicial: compania.fechaInicial?.slice(0, 10) ?? "",
    urlCargue: compania.urlCargue ?? "",
  }
}

export function CompaniaDialog({
  isOpen,
  compania,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  compania: Compania | null
  onClose: () => void
  onSubmit: (values: CompaniaFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<CompaniaFormValues>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(compania))
      setFieldErrors({})
      setMessage(null)
    }
  }, [isOpen, compania])

  // Validación: Todos los campos deben estar llenos y el NIT debe contener solo números
  const isFormValid =
    values.nit.trim() !== "" &&
    /^\d+$/.test(values.nit) &&
    values.nombre.trim() !== "" &&
    values.nombreCorto.trim() !== "" &&
    values.fechaInicial.trim() !== "" &&
    values.urlCargue.trim() !== ""

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isFormValid) return

    setPending(true)
    setFieldErrors({})
    setMessage(null)

    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      if (error instanceof CompaniaApiError) {
        setFieldErrors(error.fieldErrors)
        setMessage(error.message)
      } else {
        setMessage("Ocurrió un error inesperado.")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>
          {compania ? "Editar compañía" : "Nueva compañía"}
        </DialogTitle>
        <DialogDescription>
          {compania
            ? "Actualiza los datos de la compañía."
            : "Registra una nueva compañía en la plataforma."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        )}

        {FIELDS.map((field) => {
          const isNit = field.name === "nit"

          return (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={isNit ? "text" : (field.type ?? "text")}
                inputMode={isNit ? "numeric" : undefined}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) => {
                  let val = event.target.value
                  if (isNit) {
                    // Filtrar para permitir únicamente dígitos numéricos
                    val = val.replace(/\D/g, "")
                  }
                  setValues((current) => ({
                    ...current,
                    [field.name]: val,
                  }))
                }}
                aria-invalid={fieldErrors[field.name] ? true : undefined}
              />
              {isNit && values.nit && !/^\d+$/.test(values.nit) && (
                <p className="text-sm text-destructive">
                  El NIT debe contener exclusivamente números.
                </p>
              )}
              {fieldErrors[field.name] && (
                <p className="text-sm text-destructive">
                  {fieldErrors[field.name]?.[0]}
                </p>
              )}
            </div>
          )
        })}

        <DialogFooter>
          <Button type="button" variant="outline" onPress={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isDisabled={pending || !isFormValid}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}