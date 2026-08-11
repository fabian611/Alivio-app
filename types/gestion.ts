import type {
  Negociacion,
  SubaccionAnalisis,
  TipoContacto,
} from "@/lib/gestion"

export type Gestion = {
  id: string
  creditoId: string
  negociador: string
  tipoContacto: TipoContacto
  negociacion: Negociacion
  subaccion: SubaccionAnalisis | null
  fechaCompromiso: string | null
  compromisoCliente: string | null
  createdAt: string
  credito: {
    nroCredito: string | null
    deudor: string | null
    pagaduria: string | null
  }
}
