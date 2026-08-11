import { z } from "zod"

import { ROLES } from "@/lib/roles"
import { idSchema } from "@/lib/validations/id"

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      const trimmed = typeof value === "string" ? value.trim() : ""
      return trimmed === "" ? null : trimmed
    })
    .refine((value) => value === null || value.length <= max, {
      message: `Máximo ${max} caracteres.`,
    })

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "Máximo 72 caracteres.")

export const usuarioCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .pipe(z.email("Ingresa un correo válido."))
    .transform((value) => value.toLowerCase()),
  password: passwordSchema,
  cargo: optionalText(120),
  role: z.enum(ROLES, { error: "Selecciona un rol válido." }),
  companiaId: z
    .union([idSchema("Compañía inválida."), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
  active: z.boolean().optional().default(true),
})

export const usuarioUpdateSchema = usuarioCreateSchema
  .extend({
    id: idSchema("Identificador inválido."),
    password: z
      .union([passwordSchema, z.literal(""), z.null()])
      .optional()
      .transform((value) => (value ? value : null)),
  })

export const usuarioDeleteSchema = z.object({
  id: idSchema("Identificador inválido."),
})

export const usuarioAsignarCompaniaSchema = z.object({
  ids: z
    .array(idSchema("Identificador inválido."))
    .min(1, "Selecciona al menos un usuario."),
  companiaId: z
    .union([idSchema("Compañía inválida."), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
})
