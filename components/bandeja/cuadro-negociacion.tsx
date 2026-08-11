"use client"

import { useEffect, useState } from "react"
import {
  Analytics02Icon,
  Call02Icon,
  ContactIcon,
  FloppyDiskIcon,
  Loading03Icon,
  MoneyBag02Icon,
  SearchList01Icon,
  SentIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { AnalisisCreditoPanel } from "@/components/bandeja/analisis-credito-panel"
import { ChatWhatsapp } from "@/components/bandeja/chat-whatsapp"
import { CiudadanoModal } from "@/components/bandeja/ciudadano-modal"
import { LlamadaModal } from "@/components/bandeja/llamada-modal"
import { useNotification } from "@/components/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSoftphone } from "@/hooks/use-softphone"
import { createGestion } from "@/lib/api/gestiones"
import {
  NEGOCIACION_META,
  NEGOCIACIONES,
  SUBACCION_LABEL,
  SUBACCIONES_ANALISIS,
  TIPO_CONTACTO_META,
  TIPOS_CONTACTO,
  type Negociacion,
  type SubaccionAnalisis,
  type TipoContacto,
} from "@/lib/gestion"
import { cn } from "@/lib/utils"
import type { ConsultaCiudadano } from "@/types/ciudadano"
import type { Credito } from "@/types/credito"

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

function Celda({
  label,
  value,
  className,
  tone,
}: {
  label: string
  value: React.ReactNode
  className?: string
  tone?: "alert"
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-e p-3",
        className
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-end text-sm font-semibold text-balance",
          tone === "alert" && "text-brand-orange"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Chip({
  active,
  icon,
  onPress,
  children,
}: {
  active: boolean
  icon?: IconSvgElement
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
    >
      {icon && <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />}
      {children}
    </button>
  )
}

function Bloque({
  icon,
  title,
  children,
}: {
  icon: IconSvgElement
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />
        {title}
      </span>
      {children}
    </div>
  )
}

export function CuadroNegociacion({
  credito,
  onGuardado,
}: {
  credito: Credito
  onGuardado: () => void
}) {
  const { success, error } = useNotification()
  const [tipoContacto, setTipoContacto] = useState<TipoContacto | null>(null)
  const [negociacion, setNegociacion] = useState<Negociacion | null>(null)
  const [subaccion, setSubaccion] = useState<SubaccionAnalisis | null>(null)
  const [fechaCompromiso, setFechaCompromiso] = useState("")
  const [compromiso, setCompromiso] = useState("")
  const [pending, setPending] = useState(false)
  const [consultando, setConsultando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [chatAbierto, setChatAbierto] = useState(false)
  const {
    estado: estadoLlamada,
    error: errorLlamada,
    llamar,
    colgar,
  } = useSoftphone()
  const [consulta, setConsulta] = useState<ConsultaCiudadano | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  async function handleConsultar() {
    setConsultando(true)

    try {
      const respuesta = await fetch("/api/ciudadano", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })

      const payload = await respuesta.json().catch(() => null)

      if (!respuesta.ok) {
        throw new Error(payload?.error ?? "No pudimos consultar al ciudadano.")
      }

      setConsulta(payload.data)
      setModalAbierto(true)
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        "Consulta fallida"
      )
    } finally {
      setConsultando(false)
    }
  }

  useEffect(() => {
    setTipoContacto(null)
    setNegociacion(null)
    setSubaccion(null)
    setFechaCompromiso("")
    setCompromiso("")
  }, [credito.id])

  const canalMensaje =
    tipoContacto === "sms" || tipoContacto === "whatsapp" ? tipoContacto : null

  async function handleEnviarMensaje() {
    if (!canalMensaje || !mensaje.trim()) return

    setEnviando(true)

    try {
      const respuesta = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creditoId: credito.id,
          canal: canalMensaje,
          cuerpo: mensaje,
        }),
      })

      const payload = await respuesta.json().catch(() => null)

      if (!respuesta.ok) {
        throw new Error(payload?.error ?? "No pudimos enviar el mensaje.")
      }

      success(
        <>
          Enviado a <strong>{payload.data.to}</strong> · estado{" "}
          {payload.data.status}.
        </>,
        canalMensaje === "sms" ? "SMS enviado" : "WhatsApp enviado"
      )

      setMensaje("")
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        "No se pudo enviar"
      )
    } finally {
      setEnviando(false)
    }
  }

  const mostrarAnalisis = negociacion === "analisis_credito"
  const listo =
    tipoContacto !== null &&
    negociacion !== null &&
    (!mostrarAnalisis || subaccion !== null)

  async function handleGuardar() {
    if (!listo) return

    setPending(true)

    try {
      await createGestion({
        creditoId: credito.id,
        tipoContacto,
        negociacion,
        subaccion,
        fechaCompromiso: fechaCompromiso || null,
        compromisoCliente: compromiso || null,
      })

      success(
        <>
          Se registró la gestión de{" "}
          <strong>{credito.nroCredito ?? credito.id}</strong>.
        </>,
        "Gestión guardada"
      )

      setTipoContacto(null)
      setNegociacion(null)
      setSubaccion(null)
      setFechaCompromiso("")
      setCompromiso("")
      onGuardado()
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        "No se pudo guardar"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Cuadro de negociación</h3>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-2">
          <Celda label="Pagaduría" value={credito.pagaduria ?? "—"} />
          <Celda label="Nro crédito" value={credito.nroCredito ?? "—"} />
          <Celda label="Deudor" value={credito.deudor ?? "—"} />
          <Celda label="ID deudor" value={credito.idDeudor ?? "—"} />
          <Celda
            label="Valor crédito"
            value={money.format(Number(credito.valorCredito))}
          />
          <Celda
            label="Saldo capital"
            value={money.format(Number(credito.saldoCapital))}
            tone="alert"
          />
          <Celda
            label="Saldo int."
            value={money.format(Number(credito.saldoIntereses))}
          />
          <Celda
            label="Saldo ctas."
            value={money.format(Number(credito.saldoCuentas))}
          />
          <Celda
            label="Cuota/mes"
            value={money.format(Number(credito.cuotaMes))}
          />
          <Celda label="Cuotas total" value={credito.cuotasTotal} />
          <Celda label="Mora ini" value={credito.diasMoraIni} />
          <Celda label="Mora act" value={credito.diasMoraAct} />
          <Celda
            label="Responsable"
            value={credito.responsable || "—"}
            className="sm:col-span-2"
          />
          <Celda
            label="Regla aplicada"
            value={
              credito.regla ? (
                <Badge variant="secondary">{credito.regla}</Badge>
              ) : (
                "—"
              )
            }
            className="sm:col-span-2"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border">
        <header className="border-b bg-muted/40 px-4 py-2.5">
          <h3 className="text-sm font-semibold">Registrar gestión</h3>
        </header>

        <div className="flex flex-col gap-5 p-4">
          <div className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-8">
            <Bloque icon={ContactIcon} title="Tipo de contacto">
              <div className="flex flex-wrap gap-2">
                {TIPOS_CONTACTO.map((tipo) => (
                  <Chip
                    key={tipo}
                    active={tipoContacto === tipo}
                    icon={TIPO_CONTACTO_META[tipo].icon}
                    onPress={() => setTipoContacto(tipo)}
                  >
                    {TIPO_CONTACTO_META[tipo].label}
                  </Chip>
                ))}
              </div>
            </Bloque>

            <Bloque icon={MoneyBag02Icon} title="Negociación">
              <div className="flex flex-wrap gap-2">
                {NEGOCIACIONES.map((tipo) => (
                  <Chip
                    key={tipo}
                    active={negociacion === tipo}
                    icon={NEGOCIACION_META[tipo].icon}
                    onPress={() => {
                      setNegociacion(tipo)
                      if (tipo !== "analisis_credito") setSubaccion(null)
                    }}
                  >
                    {NEGOCIACION_META[tipo].label}
                  </Chip>
                ))}
              </div>
            </Bloque>
          </div>

          {tipoContacto === "llamada" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  <HugeiconsIcon icon={Call02Icon} size={14} strokeWidth={2} />
                  Hablar con el cliente
                </span>
                <span className="text-xs text-muted-foreground">
                  Llama desde el navegador. Necesitas diadema y dar permiso de
                  micrófono.
                </span>
              </div>

              <Button size="sm" onPress={() => llamar()}>
                <HugeiconsIcon icon={Call02Icon} size={14} />
                Llamar
              </Button>
            </div>
          )}

          {tipoContacto === "whatsapp" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  <HugeiconsIcon icon={WhatsappIcon} size={14} strokeWidth={2} />
                  Conversación por WhatsApp
                </span>
                <span className="text-xs text-muted-foreground">
                  Abre el chat con el cliente y responde en tiempo real.
                </span>
              </div>

              <Button size="sm" onPress={() => setChatAbierto(true)}>
                <HugeiconsIcon icon={WhatsappIcon} size={14} />
                Abrir chat
              </Button>
            </div>
          )}

          {canalMensaje === "sms" && (
            <div className="flex flex-col gap-2.5 rounded-md border bg-muted/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  <HugeiconsIcon icon={SentIcon} size={14} strokeWidth={2} />
                  Enviar SMS
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Número de prueba
                </Badge>
              </div>

              <textarea
                rows={3}
                maxLength={1600}
                placeholder={`Mensaje que se enviará por ${
                  canalMensaje === "sms" ? "SMS" : "WhatsApp"
                }...`}
                value={mensaje}
                onChange={(event) => setMensaje(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {mensaje.length}/1600 caracteres
                </span>
                <Button
                  size="sm"
                  isDisabled={!mensaje.trim() || enviando}
                  onPress={handleEnviarMensaje}
                >
                  <HugeiconsIcon
                    icon={enviando ? Loading03Icon : SentIcon}
                    size={14}
                    className={cn(enviando && "animate-spin")}
                  />
                  {enviando ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          )}

          {mostrarAnalisis && (
            <div className="rounded-md border bg-muted/30 p-3">
              <Bloque icon={Analytics02Icon} title="Menú análisis crédito">
                <div className="flex flex-wrap gap-2">
                  {SUBACCIONES_ANALISIS.map((sub) => (
                    <Chip
                      key={sub}
                      active={subaccion === sub}
                      onPress={() => setSubaccion(sub)}
                    >
                      {SUBACCION_LABEL[sub]}
                    </Chip>
                  ))}
                </div>
              </Bloque>
            </div>
          )}

          <div className="grid gap-4 border-t pt-4 md:grid-cols-[240px_1fr]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fechaCompromiso">Fecha compromiso</Label>
              <Input
                id="fechaCompromiso"
                type="date"
                value={fechaCompromiso}
                onChange={(event) => setFechaCompromiso(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="compromiso">Compromiso del cliente</Label>
              <textarea
                id="compromiso"
                rows={3}
                placeholder="Detalle del acuerdo con el cliente..."
                value={compromiso}
                onChange={(event) => setCompromiso(event.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            {consultando && (
              <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  className="mt-0.5 shrink-0 animate-spin text-amber-600"
                />
                <div className="text-xs">
                  <p className="font-semibold text-amber-700">
                    Consultando fuentes externas...
                  </p>
                  <p className="text-muted-foreground">
                    Se consultan varias páginas (ADRES, SIMIT, RUES, RUAF y
                    RUNT). Puede tardar varios minutos; no cierres esta
                    ventana.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {listo
                  ? "Listo para guardar."
                  : "Selecciona tipo de contacto y negociación para continuar."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  isDisabled={consultando}
                  onPress={handleConsultar}
                >
                  <HugeiconsIcon
                    icon={consultando ? Loading03Icon : SearchList01Icon}
                    size={16}
                    className={cn(consultando && "animate-spin")}
                  />
                  {consultando ? "Consultando..." : "Consultar ciudadano"}
                </Button>

                <Button isDisabled={!listo || pending} onPress={handleGuardar}>
                  <HugeiconsIcon icon={FloppyDiskIcon} size={16} />
                  {pending ? "Guardando..." : "Guardar gestión"}
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              La consulta del ciudadano recorre varias páginas oficiales y puede
              tardar unos minutos en responder.
            </p>
          </div>
        </div>
      </section>

      {mostrarAnalisis && (
        <section className="rounded-lg border p-4">
          <AnalisisCreditoPanel credito={credito} />
        </section>
      )}

      <CiudadanoModal
        isOpen={modalAbierto}
        consulta={consulta}
        onClose={() => setModalAbierto(false)}
      />

      <LlamadaModal
        estado={estadoLlamada}
        error={errorLlamada}
        deudor={credito.deudor ?? "Cliente"}
        onColgar={colgar}
      />

      <ChatWhatsapp
        isOpen={chatAbierto}
        credito={credito}
        onClose={() => setChatAbierto(false)}
      />
    </div>
  )
}
