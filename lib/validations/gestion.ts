import { z } from "zod"

import {
  NEGOCIACIONES,
  SUBACCIONES_ANALISIS,
  TIPOS_CONTACTO,
} from "@/lib/gestion"
import { idSchema } from "@/lib/validations/id"

export const gestionCreateSchema = z
  .object({
    creditoId: idSchema("Crédito inválido."),
    tipoContacto: z.enum(TIPOS_CONTACTO, {
      error: "Selecciona el tipo de contacto.",
    }),
    negociacion: z.enum(NEGOCIACIONES, {
      error: "Selecciona el tipo de negociación.",
    }),
    subaccion: z
      .union([z.enum(SUBACCIONES_ANALISIS), z.literal(""), z.null()])
      .optional()
      .transform((value) => (value ? value : null)),
    fechaCompromiso: z
      .union([z.string(), z.null()])
      .optional()
      .transform((value) => (value ? new Date(value) : null))
      .refine((value) => value === null || !Number.isNaN(value.getTime()), {
        message: "Fecha inválida.",
      }),
    compromisoCliente: z
      .union([z.string(), z.null()])
      .optional()
      .transform((value) => {
        const trimmed = typeof value === "string" ? value.trim() : ""
        return trimmed === "" ? null : trimmed
      }),
  })
  .superRefine((gestion, ctx) => {
    if (gestion.negociacion === "analisis_credito" && !gestion.subaccion) {
      ctx.addIssue({
        code: "custom",
        path: ["subaccion"],
        message: "Selecciona una opción del menú de análisis.",
      })
    }
  })
