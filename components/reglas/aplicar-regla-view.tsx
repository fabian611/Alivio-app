"use client"

import { useState } from "react"
import { SearchList01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreditosTable } from "@/components/creditos/creditos-table"
import { useNotification } from "@/components/notification-provider"
import {
  CONDICION_INICIAL,
  CondicionesBuilder,
} from "@/components/reglas/condiciones-builder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { aplicarRegla, createRegla, previewRegla } from "@/lib/api/cartera"
import type { Condiciones } from "@/lib/condiciones"
import type { NegociadorOption, PreviewResultado } from "@/types/credito"

const CONDICIONES_INICIALES: Condiciones = {
  union: "AND",
  reglas: [CONDICION_INICIAL],
}

export function AplicarReglaView({
  negociadores,
}: {
  negociadores: NegociadorOption[]
}) {
  const { success, error, confirm } = useNotification()
  const [nombre, setNombre] = useState("")
  const [condiciones, setCondiciones] = useState(CONDICIONES_INICIALES)
  const [responsables, setResponsables] = useState<string[]>([])
  const [preview, setPreview] = useState<PreviewResultado | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [aplicando, setAplicando] = useState(false)

  function toggle<T>(list: T[], value: T) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value]
  }

  async function handleBuscar() {
    setBuscando(true)
    setPreview(null)

    try {
      setPreview(await previewRegla(condiciones))
    } catch (cause) {
      error(
        cause instanceof Error ? cause.message : "No pudimos buscar créditos.",
        "Error en la búsqueda"
      )
    } finally {
      setBuscando(false)
    }
  }

  function handleAsignar() {
    if (!preview || preview.total === 0) return

    confirm({
      type: "warning",
      title: "Aplicar tratamiento",
      message: (
        <>
          Se asignarán <strong>{preview.total}</strong> crédito(s) a{" "}
          <strong>{responsables.length}</strong> negociador(es), repartidos uno
          a uno. Los créditos ya tratados se sobrescriben.
        </>
      ),
      confirmLabel: "Asignar",
      onConfirm: async () => {
        setAplicando(true)

        try {
          const regla = await createRegla({
            nombre,
            descripcion: preview.descripcion,
            condiciones,
            responsables,
          })

          const resultado = await aplicarRegla(regla.id)

          success(
            <>
              Se asignaron <strong>{resultado.aplicados}</strong> crédito(s)
              entre <strong>{resultado.negociadores}</strong> negociador(es) con
              la regla <strong>{resultado.regla}</strong>.
            </>,
            "Tratamiento aplicado"
          )

          setPreview(null)
          setNombre("")
        } catch (cause) {
          error(
            cause instanceof Error
              ? cause.message
              : "Ocurrió un error inesperado.",
            "No se pudo aplicar"
          )
        } finally {
          setAplicando(false)
        }
      },
    })
  }

  const listo =
    nombre.trim() !== "" &&
    responsables.length > 0 &&
    (preview?.total ?? 0) > 0

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre de la regla</Label>
          <Input
            id="nombre"
            className="max-w-md"
            placeholder="Ej. Mora alta — gestión telefónica"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Condiciones</Label>
          <CondicionesBuilder
            value={condiciones}
            onChange={(value) => {
              setCondiciones(value)
              setPreview(null)
            }}
          />
        </div>

        <Button
          variant="outline"
          className="self-start"
          isDisabled={buscando}
          onPress={handleBuscar}
        >
          <HugeiconsIcon icon={SearchList01Icon} size={16} />
          {buscando ? "Buscando..." : "Buscar créditos"}
        </Button>
      </section>

      {preview && (
        <>
          <section className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                {preview.total} crédito(s) cumplen la condición
              </p>
              <p className="text-sm text-muted-foreground">
                {preview.descripcion}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Responsables (negociadores)</Label>
              {negociadores.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tu compañía no tiene negociadores activos.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {negociadores.map((negociador) => (
                    <label
                      key={negociador.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary/40 has-checked:bg-primary/5"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={responsables.includes(negociador.id)}
                        onChange={() =>
                          setResponsables(toggle(responsables, negociador.id))
                        }
                      />
                      {negociador.name ?? negociador.email}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="self-start"
              isDisabled={!listo || aplicando}
              onPress={handleAsignar}
            >
              {aplicando ? "Asignando..." : "Asignar tratamiento"}
            </Button>
          </section>

          <CreditosTable creditos={preview.creditos} />
        </>
      )}
    </div>
  )
}
