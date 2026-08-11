import type { Credito } from "@/types/credito"

const LINEAS = [
  { key: "consumo", label: "Consumo", peso: 0.0584 },
  { key: "vivienda", label: "Vivienda", peso: 0.7782 },
  { key: "microcredito", label: "Microcrédito", peso: 0.0389 },
  { key: "sectorReal", label: "Sector real", peso: 0.0778 },
  { key: "sectorSolidario", label: "Sector solidario", peso: 0.0467 },
] as const

const MORA_MAXIMA_PERMITIDA = 100
const CAPACIDAD_MINIMA = 30
const ENDEUDAMIENTO_MAXIMO = 1

function semilla(texto: string) {
  let hash = 2166136261

  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return Math.abs(hash)
}

export type AnalisisCredito = ReturnType<typeof analizarCredito>

export function analizarCredito(credito: Credito) {
  const seed = semilla(credito.id)

  const saldoCapital = Number(credito.saldoCapital)
  const valorCredito = Number(credito.valorCredito)
  const cuotaMes = Number(credito.cuotaMes)

  const ingresos = 3_000_000 + (seed % 90) * 100_000
  const totalCentrales = Math.round(ingresos * 0.867)
  const moraExterna = seed % 5 === 0 ? 0 : 10 + (seed % 40)

  const lineas = LINEAS.map((linea, index) => ({
    label: linea.label,
    saldo: Math.round(totalCentrales * linea.peso),
    cuotas: Math.max(1, Math.round((totalCentrales * linea.peso) / 500_000)),
    moraMax: [0, 0, 60, 90, 30][index],
  }))

  const cuotasSector = lineas.reduce((total, linea) => total + linea.cuotas, 0)
  const moraMaxExterna = Math.max(...lineas.map((linea) => linea.moraMax))

  const gastosFamiliares = Math.round(ingresos * 0.3)
  const netoParcial = ingresos - gastosFamiliares
  const netoFinal = netoParcial - cuotasSector - cuotaMes

  const capacidadPago = (netoFinal / ingresos) * 100
  const nivelEndeudamiento = totalCentrales / ingresos

  return {
    deudor: {
      nombre: credito.deudor ?? "—",
      id: credito.idDeudor ?? "—",
      ingresos,
    },
    centrales: {
      moraExterna,
      lineas,
      total: {
        saldo: lineas.reduce((total, linea) => total + linea.saldo, 0),
        cuotas: cuotasSector,
        moraMax: moraMaxExterna,
      },
    },
    internos: {
      valorCredito,
      saldoCapital,
      cuota: cuotaMes,
      moraActual: credito.diasMoraAct,
    },
    motor: {
      ingresoTotal: ingresos,
      gastosFamiliares,
      netoParcial,
      cuotasSector,
      cuotasInternas: cuotaMes,
      netoFinal,
      capacidadPago,
      cumpleCapacidad: capacidadPago >= CAPACIDAD_MINIMA,
      nivelEndeudamiento,
      cumpleEndeudamiento: nivelEndeudamiento <= ENDEUDAMIENTO_MAXIMO,
      moraInterna: credito.diasMoraAct,
      moraMaxima: MORA_MAXIMA_PERMITIDA,
      cumpleMora: credito.diasMoraAct <= MORA_MAXIMA_PERMITIDA,
    },
  }
}
