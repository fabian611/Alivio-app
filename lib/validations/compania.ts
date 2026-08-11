import { z } from "zod"

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

export const companiaCreateSchema = z.object({
  nit: optionalText(30),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(160, "Máximo 160 caracteres."),
  nombreCorto: optionalText(60),
  fechaInicial: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => (value ? new Date(value) : null))
    .refine((value) => value === null || !Number.isNaN(value.getTime()), {
      message: "Fecha inválida.",
    }),
  urlCargue: optionalText(300).refine(
    (value) => value === null || URL.canParse(value),
    { message: "URL inválida." }
  ),
})

export const companiaUpdateSchema = companiaCreateSchema.extend({
  id: idSchema("Identificador inválido."),
})

export const companiaDeleteSchema = z.object({
  id: idSchema("Identificador inválido."),
})

export type CompaniaCreateInput = z.input<typeof companiaCreateSchema>
export type CompaniaUpdateInput = z.input<typeof companiaUpdateSchema>
