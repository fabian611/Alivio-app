"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Call, Device } from "@twilio/voice-sdk"

export type EstadoLlamada =
  | "inactivo"
  | "conectando"
  | "timbrando"
  | "en_llamada"
  | "error"

export function useSoftphone() {
  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const [estado, setEstado] = useState<EstadoLlamada>("inactivo")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      callRef.current?.disconnect()
      deviceRef.current?.destroy()
      deviceRef.current = null
    }
  }, [])

  const obtenerDevice = useCallback(async () => {
    if (deviceRef.current) return deviceRef.current

    const respuesta = await fetch("/api/voz/token", { cache: "no-store" })
    const payload = await respuesta.json().catch(() => null)

    if (!respuesta.ok) {
      throw new Error(payload?.error ?? "No pudimos obtener el token de voz.")
    }

    const { Device } = await import("@twilio/voice-sdk")

    const device = new Device(payload.data.token, {
      codecPreferences: ["opus", "pcmu"] as never,
    })

    device.on("error", (cause: { message?: string }) => {
      setError(cause?.message ?? "Error en el dispositivo de voz.")
      setEstado("error")
    })

    await device.register()
    deviceRef.current = device

    return device
  }, [])

  const llamar = useCallback(
    async (destino?: string) => {
      setError(null)
      setEstado("conectando")

      try {
        const device = await obtenerDevice()

        const call = await device.connect({
          params: destino ? { To: destino } : {},
        })

        callRef.current = call
        setEstado("timbrando")

        call.on("accept", () => setEstado("en_llamada"))
        call.on("disconnect", () => {
          callRef.current = null
          setEstado("inactivo")
        })
        call.on("cancel", () => {
          callRef.current = null
          setEstado("inactivo")
        })
        call.on("error", (cause: { message?: string }) => {
          setError(cause?.message ?? "Error durante la llamada.")
          setEstado("error")
        })
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No pudimos iniciar la llamada."
        )
        setEstado("error")
      }
    },
    [obtenerDevice]
  )

  const colgar = useCallback(() => {
    callRef.current?.disconnect()
    callRef.current = null
    setEstado("inactivo")
  }, [])

  return { estado, error, llamar, colgar }
}
