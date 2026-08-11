export type EstadoFuente = "OK" | string

export type Multa = {
  placa: string | null
  valorPagar: number | null
  valor: number | null
  estadoCartera: string | null
  organismoTransito: string | null
  numeroResolucion: string | null
  fechaComparendo: string | null
  infracciones: {
    codigoInfraccion: string | null
    descripcionInfraccion: string | null
  }[]
}

export type AcuerdoPago = {
  resolucion: string | null
  fechaResolucion: string | null
  valorAcuerdo: number | null
  totalAbonado: number | null
  pendiente: number | null
  cantCuotasAbonadas: number | null
  cantTotalCuotasPlanPago: number | null
}

export type ConsultaCiudadano = {
  ok: boolean
  cedula: string
  fecha_consulta: string
  estado_general: Record<string, EstadoFuente>
  result: {
    resultado_adres?: {
      ok: boolean
      data?: Record<string, string>
    }
    resultado_simit?: {
      ok: boolean
      data?: {
        multas?: Multa[]
        acuerdosPago?: AcuerdoPago[]
        totalGeneral?: number
        totalMultas?: number
        totalAp?: number
        pazSalvo?: boolean
      }
    }
    resultado_rues?: {
      ok: boolean
      total?: number
      hits?: Record<string, unknown>[]
    }
    resultado_ruaf?: {
      ok: boolean
      data?: { secciones?: Record<string, unknown>[] }
    }
    resultado_runt_ciudadano?: {
      ok: boolean
      licencias?: Record<string, unknown>[]
    }
    resultado_runt_placa?: {
      ok: boolean
      placa?: string
      infoVehiculo?: Record<string, string | number | null>
      soat?: Record<string, string | null>[]
    }
  }
}
