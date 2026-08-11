"use client"

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CAMPOS,
  OPERADORES_NUMERO,
  OPERADORES_TEXTO,
  type Campo,
  type Condicion,
  type Condiciones,
} from "@/lib/condiciones"

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

const CONDICION_INICIAL: Condicion = {
  campo: "diasMoraAct",
  operador: "gte",
  valor: 30,
  valorHasta: null,
}

export function CondicionesBuilder({
  value,
  onChange,
}: {
  value: Condiciones
  onChange: (condiciones: Condiciones) => void
}) {
  function update(index: number, patch: Partial<Condicion>) {
    onChange({
      ...value,
      reglas: value.reglas.map((condicion, i) =>
        i === index ? { ...condicion, ...patch } : condicion
      ),
    })
  }

  function cambiarCampo(index: number, campo: Campo) {
    const tipo = CAMPOS[campo].tipo

    update(index, {
      campo,
      operador: tipo === "number" ? "gte" : "contains",
      valor: tipo === "number" ? 0 : "",
      valorHasta: null,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Cumplir</span>
        <select
          className={selectClass}
          value={value.union}
          onChange={(event) =>
            onChange({
              ...value,
              union: event.target.value as Condiciones["union"],
            })
          }
        >
          <option value="AND">todas las condiciones</option>
          <option value="OR">al menos una condición</option>
        </select>
      </div>

      {value.reglas.map((condicion, index) => {
        const tipo = CAMPOS[condicion.campo].tipo
        const operadores =
          tipo === "number" ? OPERADORES_NUMERO : OPERADORES_TEXTO

        return (
          <div
            key={index}
            className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2"
          >
            <select
              className={selectClass}
              value={condicion.campo}
              onChange={(event) =>
                cambiarCampo(index, event.target.value as Campo)
              }
            >
              {Object.entries(CAMPOS).map(([campo, meta]) => (
                <option key={campo} value={campo}>
                  {meta.label}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={condicion.operador}
              onChange={(event) =>
                update(index, {
                  operador: event.target.value,
                  valorHasta:
                    event.target.value === "between"
                      ? condicion.valorHasta
                      : null,
                })
              }
            >
              {Object.entries(operadores).map(([operador, label]) => (
                <option key={operador} value={operador}>
                  {label}
                </option>
              ))}
            </select>

            <Input
              className="w-36"
              type={tipo === "number" ? "number" : "text"}
              value={String(condicion.valor)}
              onChange={(event) => update(index, { valor: event.target.value })}
            />

            {condicion.operador === "between" && (
              <>
                <span className="text-sm text-muted-foreground">y</span>
                <Input
                  className="w-36"
                  type="number"
                  value={String(condicion.valorHasta ?? "")}
                  onChange={(event) =>
                    update(index, { valorHasta: event.target.value })
                  }
                />
              </>
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar condición"
              isDisabled={value.reglas.length === 1}
              onPress={() =>
                onChange({
                  ...value,
                  reglas: value.reglas.filter((_, i) => i !== index),
                })
              }
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </Button>
          </div>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onPress={() =>
          onChange({ ...value, reglas: [...value.reglas, CONDICION_INICIAL] })
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
        Agregar condición
      </Button>
    </div>
  )
}

export { CONDICION_INICIAL }
