import type { Condiciones } from "@/lib/condiciones"
import type { Canal } from "@/lib/validations/regla"

export type Credito = {
  id: string
  pagaduria: string | null
  nroCredito: string | null
  idDeudor: string | null
  deudor: string | null
  valorCredito: string
  saldoCapital: string
  saldoIntereses: string
  saldoCuentas: string
  cuotaMes: string
  cuotasTotal: number
  diasMoraIni: number
  diasMoraAct: number
  estado: string
  regla: string
  responsable: string
  responsables: string[]
  canal: string[]
  createdAt: string
}

export type Regla = {
  id: string
  nombre: string
  descripcion: string | null
  condiciones: Condiciones
  canal: Canal[]
  responsables: string[]
  activa: boolean
  createdAt: string
}

export type NegociadorOption = {
  id: string
  name: string | null
  email: string
}

export type ReglaOption = {
  id: string
  nombre: string
}

export type PreviewResultado = {
  total: number
  descripcion: string
  creditos: Credito[]
}
