import { z } from "zod"

export const CAMPOS = {
  diasMoraAct: { label: "Días de mora actual", tipo: "number" },
  diasMoraIni: { label: "Días de mora inicial", tipo: "number" },
  saldoCapital: { label: "Saldo capital", tipo: "number" },
  saldoIntereses: { label: "Saldo intereses", tipo: "number" },
  saldoCuentas: { label: "Saldo cuentas", tipo: "number" },
  valorCredito: { label: "Valor del crédito", tipo: "number" },
  cuotaMes: { label: "Cuota mensual", tipo: "number" },
  cuotasTotal: { label: "Cuotas totales", tipo: "number" },
  pagaduria: { label: "Pagaduría", tipo: "text" },
  deudor: { label: "Deudor", tipo: "text" },
  nroCredito: { label: "Nro. de crédito", tipo: "text" },
  estado: { label: "Estado", tipo: "text" },
} as const

export type Campo = keyof typeof CAMPOS

export const OPERADORES_NUMERO = {
  gte: "mayor o igual que",
  lte: "menor o igual que",
  gt: "mayor que",
  lt: "menor que",
  equals: "igual a",
  between: "entre",
} as const

export const OPERADORES_TEXTO = {
  equals: "igual a",
  contains: "contiene",
  startsWith: "empieza por",
} as const

export const campoSchema = z.enum(
  Object.keys(CAMPOS) as [Campo, ...Campo[]]
)

export const condicionSchema = z
  .object({
    campo: campoSchema,
    operador: z.string(),
    valor: z.union([z.string(), z.number()]),
    valorHasta: z.union([z.string(), z.number()]).nullish(),
  })
  .superRefine((condicion, ctx) => {
    const tipo = CAMPOS[condicion.campo].tipo
    const validos =
      tipo === "number" ? OPERADORES_NUMERO : OPERADORES_TEXTO

    if (!(condicion.operador in validos)) {
      ctx.addIssue({
        code: "custom",
        message: `Operador inválido para ${CAMPOS[condicion.campo].label}.`,
      })
      return
    }

    if (tipo === "number" && Number.isNaN(Number(condicion.valor))) {
      ctx.addIssue({ code: "custom", message: "El valor debe ser numérico." })
    }

    if (
      condicion.operador === "between" &&
      (condicion.valorHasta == null ||
        Number.isNaN(Number(condicion.valorHasta)))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Indica el valor final del rango.",
      })
    }
  })

export const condicionesSchema = z.object({
  union: z.enum(["AND", "OR"]).default("AND"),
  reglas: z.array(condicionSchema).min(1, "Agrega al menos una condición."),
})

export type Condicion = z.infer<typeof condicionSchema>
export type Condiciones = z.infer<typeof condicionesSchema>

function filtroDe(condicion: Condicion) {
  const { campo, operador, valor, valorHasta } = condicion
  const tipo = CAMPOS[campo].tipo

  if (tipo === "text") {
    const texto = String(valor)

    if (operador === "equals") return { [campo]: texto }

    return {
      [campo]: { [operador]: texto, mode: "insensitive" as const },
    }
  }

  const numero = Number(valor)

  if (operador === "between") {
    return { [campo]: { gte: numero, lte: Number(valorHasta) } }
  }

  if (operador === "equals") return { [campo]: numero }

  return { [campo]: { [operador]: numero } }
}

export function condicionesToWhere(condiciones: Condiciones) {
  const filtros = condiciones.reglas.map(filtroDe)

  return condiciones.union === "OR" ? { OR: filtros } : { AND: filtros }
}

export function describirCondiciones(condiciones: Condiciones) {
  const union = condiciones.union === "OR" ? " o " : " y "

  return condiciones.reglas
    .map((condicion) => {
      const { label, tipo } = CAMPOS[condicion.campo]
      const operadores =
        tipo === "number" ? OPERADORES_NUMERO : OPERADORES_TEXTO
      const operador =
        operadores[condicion.operador as keyof typeof operadores] ??
        condicion.operador

      if (condicion.operador === "between") {
        return `${label} ${operador} ${condicion.valor} y ${condicion.valorHasta}`
      }

      return `${label} ${operador} ${condicion.valor}`
    })
    .join(union)
}
