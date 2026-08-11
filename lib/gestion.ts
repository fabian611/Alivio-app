import {
  Analytics02Icon,
  Calendar03Icon,
  Call02Icon,
  CallEnd01Icon,
  DollarCircleIcon,
  PercentCircleIcon,
  SmsCodeIcon,
  UserSharingIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export const TIPOS_CONTACTO = ["whatsapp", "llamada", "presencial", "sms"] as const

export type TipoContacto = (typeof TIPOS_CONTACTO)[number]

export const TIPO_CONTACTO_META: Record<
  TipoContacto,
  { label: string; icon: IconSvgElement }
> = {
  whatsapp: { label: "WhatsApp", icon: WhatsappIcon },
  llamada: { label: "Llamada", icon: Call02Icon },
  presencial: { label: "Presencial", icon: UserSharingIcon },
  sms: { label: "SMS", icon: SmsCodeIcon },
}

export const TIPO_CONTACTO_LABEL: Record<TipoContacto, string> = {
  whatsapp: TIPO_CONTACTO_META.whatsapp.label,
  llamada: TIPO_CONTACTO_META.llamada.label,
  presencial: TIPO_CONTACTO_META.presencial.label,
  sms: TIPO_CONTACTO_META.sms.label,
}

export const NEGOCIACIONES = [
  "analisis_credito",
  "plazo",
  "condonacion",
  "no_contesta",
  "compromiso_pago",
] as const

export type Negociacion = (typeof NEGOCIACIONES)[number]

export const NEGOCIACION_META: Record<
  Negociacion,
  { label: string; icon: IconSvgElement }
> = {
  analisis_credito: { label: "Análisis crédito", icon: Analytics02Icon },
  plazo: { label: "Plazo", icon: Calendar03Icon },
  condonacion: { label: "Condonación", icon: PercentCircleIcon },
  no_contesta: { label: "Cliente no contesta", icon: CallEnd01Icon },
  compromiso_pago: { label: "Compromiso de pago", icon: DollarCircleIcon },
}

export const NEGOCIACION_LABEL: Record<Negociacion, string> = {
  analisis_credito: NEGOCIACION_META.analisis_credito.label,
  plazo: NEGOCIACION_META.plazo.label,
  condonacion: NEGOCIACION_META.condonacion.label,
  no_contesta: NEGOCIACION_META.no_contesta.label,
  compromiso_pago: NEGOCIACION_META.compromiso_pago.label,
}

export const SUBACCIONES_ANALISIS = [
  "capacidad_pago",
  "revision_historial",
  "alternativas_normalizacion",
] as const

export type SubaccionAnalisis = (typeof SUBACCIONES_ANALISIS)[number]

export const SUBACCION_LABEL: Record<SubaccionAnalisis, string> = {
  capacidad_pago: "Validar capacidad de pago",
  revision_historial: "Revisión historial",
  alternativas_normalizacion: "Alternativas de normalización",
}
