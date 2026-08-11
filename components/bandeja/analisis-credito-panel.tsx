"use client"

import { analizarCredito } from "@/lib/analisis-credito"
import { cn } from "@/lib/utils"
import type { Credito } from "@/types/credito"

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

function Dato({
  label,
  value,
  tone,
}: {
  label: string
  value: React.ReactNode
  tone?: "ok" | "bad"
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          tone === "ok" && "text-green-600",
          tone === "bad" && "text-destructive"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Seccion({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border p-3">
      <h4 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h4>
      {children}
    </section>
  )
}

export function AnalisisCreditoPanel({ credito }: { credito: Credito }) {
  const analisis = analizarCredito(credito)
  const { deudor, centrales, internos, motor } = analisis

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">Análisis crédito</h3>
        <p className="text-xs text-muted-foreground">
          Vista tipo hoja de cálculo · datos de centrales simulados
        </p>
      </div>

      <Seccion title="Datos del deudor">
        <Dato label="Nombre" value={deudor.nombre} />
        <Dato label="ID" value={deudor.id} />
        <Dato label="Ingresos" value={money.format(deudor.ingresos)} />
      </Seccion>

      <Seccion title="Datos centrales">
        <Dato label="Mora externa" value={centrales.moraExterna} />
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-1 text-start font-normal" />
                <th className="py-1 text-end font-normal">Saldo</th>
                <th className="py-1 text-end font-normal">Cuotas</th>
                <th className="py-1 text-end font-normal">Mora máx</th>
              </tr>
            </thead>
            <tbody>
              {centrales.lineas.map((linea) => (
                <tr key={linea.label} className="border-b last:border-0">
                  <td className="py-1">{linea.label}</td>
                  <td className="py-1 text-end tabular-nums">
                    {money.format(linea.saldo)}
                  </td>
                  <td className="py-1 text-end tabular-nums">{linea.cuotas}</td>
                  <td className="py-1 text-end tabular-nums">
                    {linea.moraMax}
                  </td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="py-1">Total</td>
                <td className="py-1 text-end tabular-nums">
                  {money.format(centrales.total.saldo)}
                </td>
                <td className="py-1 text-end tabular-nums">
                  {centrales.total.cuotas}
                </td>
                <td className="py-1 text-end tabular-nums">
                  {centrales.total.moraMax}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Seccion>

      <Seccion title="Datos internos">
        <Dato
          label="Valor crédito"
          value={money.format(internos.valorCredito)}
        />
        <Dato
          label="Saldo capital"
          value={money.format(internos.saldoCapital)}
        />
        <Dato label="Cuota" value={money.format(internos.cuota)} />
        <Dato label="Mora actual" value={internos.moraActual} />
      </Seccion>

      <Seccion title="Motor financiero">
        <Dato
          label="Ingreso total"
          value={money.format(motor.ingresoTotal)}
        />
        <Dato
          label="Gastos familiares"
          value={money.format(motor.gastosFamiliares)}
        />
        <Dato label="Neto parcial" value={money.format(motor.netoParcial)} />
        <Dato label="Cuotas sector" value={motor.cuotasSector} />
        <Dato
          label="Cuotas internas"
          value={money.format(motor.cuotasInternas)}
        />
        <Dato label="Neto final" value={money.format(motor.netoFinal)} />
        <Dato
          label="Capacidad de pago"
          value={`${motor.capacidadPago.toFixed(2)}%`}
        />
        <Dato
          label="Cumple capacidad"
          value={motor.cumpleCapacidad ? "Sí" : "No"}
          tone={motor.cumpleCapacidad ? "ok" : "bad"}
        />
        <Dato
          label="Nivel endeudamiento"
          value={motor.nivelEndeudamiento.toFixed(2)}
        />
        <Dato
          label="Cumple endeudamiento"
          value={motor.cumpleEndeudamiento ? "Sí" : "No"}
          tone={motor.cumpleEndeudamiento ? "ok" : "bad"}
        />
        <Dato
          label="Mora interna / máx"
          value={`${motor.moraInterna} / ${motor.moraMaxima}`}
        />
        <Dato
          label="Cumple mora"
          value={motor.cumpleMora ? "Sí" : "No"}
          tone={motor.cumpleMora ? "ok" : "bad"}
        />
      </Seccion>
    </div>
  )
}
