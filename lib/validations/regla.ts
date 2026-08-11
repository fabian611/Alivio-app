import { z } from "zod"

import { condicionesSchema } from "@/lib/condiciones"
import { idSchema } from "@/lib/validations/id"

export const CANALES = [
  "llamada",
  "sms",
  "email",
  "whatsapp",
  "visita",
] as const

export type Canal = (typeof CANALES)[number]

export const CANAL_LABEL: Record<Canal, string> = {
  llamada: "Llamada",
  sms: "SMS",
  email: "Correo",
  whatsapp: "WhatsApp",
  visita: "Visita",
}

export const reglaCreateSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  descripcion: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      const trimmed = typeof value === "string" ? value.trim() : ""
      return trimmed === "" ? null : trimmed
    }),
  condiciones: condicionesSchema,
  canal: z.array(z.enum(CANALES)).optional().default([]),
  responsables: z
    .array(idSchema("Responsable inválido."))
    .min(1, "Selecciona al menos un negociador."),
})

export const reglaUpdateSchema = reglaCreateSchema.extend({
  id: idSchema("Identificador inválido."),
})

export const reglaDeleteSchema = z.object({
  id: idSchema("Identificador inválido."),
})

export const aplicarReglaSchema = z.object({
  reglaId: idSchema("Regla inválida."),
})

export const previewSchema = z.object({
  condiciones: condicionesSchema,
})
