"use client"

import { useEffect, useState } from "react"
import { Call02Icon, CallEnd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import type { EstadoLlamada } from "@/hooks/use-softphone"
import { cn } from "@/lib/utils"

const ETIQUETAS: Record<EstadoLlamada, string> = {
  inactivo: "",
  conectando: "Conectando...",
  timbrando: "Timbrando...",
  en_llamada: "En llamada",
  error: "Llamada fallida",
}

function formatoDuracion(segundos: number) {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60

  return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`
}

export function LlamadaModal({
  estado,
  error,
  deudor,
  onColgar,
}: {
  estado: EstadoLlamada
  error: string | null
  deudor: string
  onColgar: () => void
}) {
  const [duracion, setDuracion] = useState(0)

  useEffect(() => {
    if (estado !== "en_llamada") {
      setDuracion(0)
      return
    }

    const intervalo = setInterval(() => setDuracion((s) => s + 1), 1000)
    return () => clearInterval(intervalo)
  }, [estado])

  const abierto = estado !== "inactivo"
  const activa = estado === "timbrando" || estado === "en_llamada"

  return (
    <Dialog
      isOpen={abierto}
      isDismissable={false}
      showCloseButton={false}
      onOpenChange={(open) => !open && onColgar()}
      className="sm:max-w-xs"
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-full",
            estado === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-green-500/10 text-green-600",
            activa && "animate-pulse"
          )}
        >
          <HugeiconsIcon
            icon={estado === "error" ? CallEnd01Icon : Call02Icon}
            size={28}
            strokeWidth={2}
          />
        </span>

        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">{deudor}</p>
          <p
            className={cn(
              "text-sm",
              estado === "error" ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error ?? ETIQUETAS[estado]}
          </p>
          {estado === "en_llamada" && (
            <p className="text-2xl font-semibold tabular-nums">
              {formatoDuracion(duracion)}
            </p>
          )}
        </div>

        <Button
          variant={estado === "error" ? "outline" : "destructive"}
          className="w-full"
          onPress={onColgar}
        >
          <HugeiconsIcon icon={CallEnd01Icon} size={16} />
          {estado === "error" ? "Cerrar" : "Colgar"}
        </Button>
      </div>
    </Dialog>
  )
}
