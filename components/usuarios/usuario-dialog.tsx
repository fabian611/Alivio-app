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
import { UsuarioApiError } from "@/lib/api/usuarios"
import { ROLE_LABEL, ROLES, type Role } from "@/lib/roles"
import type {
  CompaniaOption,
  Usuario,
  UsuarioFieldErrors,
  UsuarioFormValues,
} from "@/types/usuario"

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

const EMPTY: UsuarioFormValues = {
  name: "",
  email: "",
  password: "",
  cargo: "",
  role: "gestor",
  companiaId: "",
  active: true,
}

function toFormValues(usuario: Usuario | null): UsuarioFormValues {
  if (!usuario) return EMPTY

  return {
    name: usuario.name ?? "",
    email: usuario.email,
    password: "",
    cargo: usuario.cargo ?? "",
    role: usuario.role,
    companiaId: usuario.companiaId ?? "",
    active: usuario.active,
  }
}

export function UsuarioDialog({
  isOpen,
  usuario,
  companias,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  usuario: Usuario | null
  companias: CompaniaOption[]
  onClose: () => void
  onSubmit: (values: UsuarioFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<UsuarioFormValues>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<UsuarioFieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(usuario))
      setFieldErrors({})
      setMessage(null)
    }
  }, [isOpen, usuario])

  function update<K extends keyof UsuarioFormValues>(
    key: K,
    value: UsuarioFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setFieldErrors({})
    setMessage(null)

    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      if (error instanceof UsuarioApiError) {
        setFieldErrors(error.fieldErrors as UsuarioFieldErrors)
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
        <DialogTitle>{usuario ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        <DialogDescription>
          {usuario
            ? "Actualiza los datos y la compañía asignada."
            : "Crea un usuario y asígnale una compañía."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={fieldErrors.name ? true : undefined}
          />
          {fieldErrors.name && (
            <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            {usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={usuario ? "Dejar vacío para no cambiarla" : undefined}
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
          />
          {fieldErrors.password && (
            <p className="text-sm text-destructive">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={values.cargo}
            onChange={(event) => update("cargo", event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Rol</Label>
          <select
            id="role"
            className={selectClass}
            value={values.role}
            onChange={(event) => update("role", event.target.value as Role)}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="companiaId">Compañía</Label>
          <select
            id="companiaId"
            className={selectClass}
            value={values.companiaId}
            onChange={(event) => update("companiaId", event.target.value)}
          >
            <option value="">Sin compañía</option>
            {companias.map((compania) => (
              <option key={compania.id} value={compania.id}>
                {compania.nombre}
              </option>
            ))}
          </select>
          {fieldErrors.companiaId && (
            <p className="text-sm text-destructive">
              {fieldErrors.companiaId[0]}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(event) => update("active", event.target.checked)}
            className="size-4 accent-primary"
          />
          Usuario activo
        </label>

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
