"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert02Icon,
  Loading03Icon,
  SentIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useNotification } from "@/components/notification-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { Conversacion } from "@/types/conversacion"
import type { Credito } from "@/types/credito"

const POLLING_MS = 4000

const hora = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
})

export function ChatWhatsapp({
  isOpen,
  credito,
  onClose,
}: {
  isOpen: boolean
  credito: Credito
  onClose: () => void
}) {
  const { error } = useNotification()
  const [conversacion, setConversacion] = useState<Conversacion | null>(null)
  const [cargando, setCargando] = useState(false)
  const [borrador, setBorrador] = useState("")
  const [enviando, setEnviando] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  const cargar = useCallback(async () => {
    try {
      const respuesta = await fetch(
        `/api/conversaciones?creditoId=${credito.id}`,
        { cache: "no-store" }
      )

      const payload = await respuesta.json().catch(() => null)

      if (respuesta.ok) {
        setConversacion(payload?.data ?? null)
      }
    } catch {
      // el polling reintenta solo
    }
  }, [credito.id])

  useEffect(() => {
    if (!isOpen) return

    setCargando(true)
    cargar().finally(() => setCargando(false))

    const intervalo = setInterval(cargar, POLLING_MS)
    return () => clearInterval(intervalo)
  }, [isOpen, cargar])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversacion?.mensajes.length])

  async function handleEnviar() {
    if (!borrador.trim()) return

    setEnviando(true)

    try {
      const respuesta = await fetch("/api/conversaciones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ creditoId: credito.id, cuerpo: borrador }),
      })

      const payload = await respuesta.json().catch(() => null)

      if (!respuesta.ok) {
        throw new Error(payload?.error ?? "No pudimos enviar el mensaje.")
      }

      setBorrador("")
      await cargar()
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        "No se pudo enviar"
      )
    } finally {
      setEnviando(false)
    }
  }

  const mensajes = conversacion?.mensajes ?? []
  const sinConversacion = conversacion === null

  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      side="right"
      className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
    >
      <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={WhatsappIcon} size={18} />
            {credito.deudor ?? "Cliente"}
          </SheetTitle>
          <SheetDescription>
            {conversacion?.telefono ?? "Sin conversación iniciada"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cargando && mensajes.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              Cargando...
            </p>
          ) : mensajes.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {sinConversacion
                ? "Aún no has escrito a este cliente. El primer mensaje inicia la conversación."
                : "Sin mensajes."}
            </p>
          ) : (
            mensajes.map((mensaje) => {
              const saliente = mensaje.direccion === "out"

              return (
                <div
                  key={mensaje.id}
                  className={cn(
                    "flex flex-col gap-0.5",
                    saliente ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      saliente
                        ? "rounded-br-sm bg-brand-navy text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {mensaje.cuerpo}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {hora.format(new Date(mensaje.createdAt))}
                    {mensaje.errorMensaje && (
                      <HugeiconsIcon
                        icon={Alert02Icon}
                        size={11}
                        className="text-destructive"
                      />
                    )}
                  </span>
                </div>
              )
            })
          )}
          <div ref={finRef} />
        </div>

        <div className="flex flex-col gap-2 border-t p-4">
          {conversacion && !conversacion.ventanaAbierta && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-700">
              La ventana de 24 h está cerrada. Si el cliente no ha respondido,
              WhatsApp puede rechazar mensajes de texto libre y exigir una
              plantilla aprobada.
            </p>
          )}

          <textarea
            rows={2}
            maxLength={1600}
            placeholder="Escribe un mensaje..."
            value={borrador}
            onChange={(event) => setBorrador(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleEnviar()
              }
            }}
            className="w-full resize-none rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              Enter envía · Shift+Enter salta línea
            </span>
            <Button
              size="sm"
              isDisabled={!borrador.trim() || enviando}
              onPress={handleEnviar}
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
    </Sheet>
  )
}
