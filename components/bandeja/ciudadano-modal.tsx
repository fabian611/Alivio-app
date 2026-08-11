"use client"

import {
  Building02Icon,
  Car01Icon,
  CheckmarkCircle02Icon,
  MultiplicationSignCircleIcon,
  ShieldUserIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ConsultaCiudadano } from "@/types/ciudadano"

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

const FUENTES: {
  key: string
  sigla: string
  label: string
  icon: IconSvgElement
}[] = [
  { key: "adres", sigla: "ADRES", label: "Salud", icon: ShieldUserIcon },
  { key: "simit", sigla: "SIMIT", label: "Multas", icon: Car01Icon },
  { key: "rues", sigla: "RUES", label: "Mercantil", icon: Building02Icon },
  { key: "ruaf", sigla: "RUAF", label: "Afiliaciones", icon: UserCircleIcon },
  {
    key: "runt_ciudadano",
    sigla: "RUNT CC",
    label: "Licencias",
    icon: UserCircleIcon,
  },
  { key: "runt_placa", sigla: "RUNT PLACA", label: "Vehículo", icon: Car01Icon },
]

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2 last:border-0">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

function Seccion({
  icon,
  titulo,
  badge,
  children,
}: {
  icon: IconSvgElement
  titulo: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border">
      <header className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <HugeiconsIcon icon={icon} size={15} strokeWidth={2} />
        <h4 className="text-xs font-semibold">{titulo}</h4>
        {badge && <div className="ms-auto">{badge}</div>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  )
}

export function CiudadanoModal({
  isOpen,
  consulta,
  onClose,
}: {
  isOpen: boolean
  consulta: ConsultaCiudadano | null
  onClose: () => void
}) {
  const adres = consulta?.result.resultado_adres?.data
  const simit = consulta?.result.resultado_simit?.data
  const rues = consulta?.result.resultado_rues
  const runtPlaca = consulta?.result.resultado_runt_placa
  const vehiculo = runtPlaca?.infoVehiculo

  const multas = simit?.multas ?? []
  const acuerdos = simit?.acuerdosPago ?? []

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-h-[92svh] w-[min(96vw,64rem)] overflow-y-auto sm:max-w-none"
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={UserCircleIcon} size={18} />
          Datos del ciudadano
          {consulta && (
            <span className="text-xs font-normal text-muted-foreground">
              · CC {consulta.cedula}
            </span>
          )}
        </DialogTitle>
      </DialogHeader>

      {!consulta ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin datos de consulta.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {FUENTES.map((fuente) => {
              const estado = consulta.estado_general?.[fuente.key]
              const ok = estado === "OK"

              return (
                <div
                  key={fuente.key}
                  className="flex items-center gap-2 rounded-lg border p-2.5"
                >
                  <HugeiconsIcon
                    icon={
                      ok ? CheckmarkCircle02Icon : MultiplicationSignCircleIcon
                    }
                    size={16}
                    strokeWidth={2}
                    className={cn(
                      ok ? "text-green-600" : "text-muted-foreground"
                    )}
                  />
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      {fuente.sigla}
                    </span>
                    <span className="truncate text-xs font-medium">
                      {fuente.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {adres && (
            <Seccion
              icon={ShieldUserIcon}
              titulo="ADRES · Salud"
              badge={
                <Badge className="border-green-500/20 bg-green-500/10 text-green-600">
                  {adres["ESTADO"] ?? "—"}
                </Badge>
              }
            >
              <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Estado" value={adres["ESTADO"]} />
                <Dato label="Régimen" value={adres["REGIMEN"]} />
                <Dato label="Entidad (EPS)" value={adres["ENTIDAD"]} />
                <Dato label="Tipo de afiliado" value={adres["TIPO DE AFILIADO"]} />
                <Dato label="Nombres" value={adres["NOMBRES"]} />
                <Dato label="Apellidos" value={adres["APELLIDOS"]} />
                <Dato
                  label="Fecha afiliación"
                  value={adres["FECHA DE AFILIACIÓN EFECTIVA"]}
                />
                <Dato
                  label="Departamento / Municipio"
                  value={[adres["DEPARTAMENTO"], adres["MUNICIPIO"]]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </div>
            </Seccion>
          )}

          {simit && (
            <Seccion
              icon={Car01Icon}
              titulo="SIMIT · Multas de tránsito"
              badge={
                <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-600">
                  {multas.length} multas
                </Badge>
              }
            >
              <div className="flex flex-col gap-3">
                <div className="rounded-md border-s-4 border-s-amber-500 bg-amber-500/5 px-3 py-2">
                  <p className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                    Total general adeudado
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {money.format(simit.totalGeneral ?? 0)}
                  </p>
                </div>

                {acuerdos.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Acuerdos de pago activos
                    </p>
                    {acuerdos.map((acuerdo, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs"
                      >
                        Resolución {acuerdo.resolucion} ·{" "}
                        {acuerdo.fechaResolucion} · Valor{" "}
                        {money.format(acuerdo.valorAcuerdo ?? 0)} · Abonado{" "}
                        {money.format(acuerdo.totalAbonado ?? 0)} · Pendiente{" "}
                        {money.format(acuerdo.pendiente ?? 0)} · Cuotas{" "}
                        {acuerdo.cantCuotasAbonadas}/
                        {acuerdo.cantTotalCuotasPlanPago}
                      </div>
                    ))}
                  </div>
                )}

                {multas.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Multas y comparendos ({multas.length})
                    </p>
                    <div className="grid gap-2 lg:grid-cols-2">
                      {multas.map((multa, index) => (
                        <div
                          key={index}
                          className="rounded-md border p-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold">
                              {multa.infracciones?.[0]?.codigoInfraccion ?? "—"}{" "}
                              · {multa.placa ?? "—"}
                            </span>
                            <span className="shrink-0 font-semibold text-destructive tabular-nums">
                              {money.format(multa.valorPagar ?? multa.valor ?? 0)}
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            {multa.infracciones?.[0]?.descripcionInfraccion ??
                              "—"}
                          </p>
                          <p className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                            <span>Estado: {multa.estadoCartera ?? "—"}</span>
                            <span>
                              Organismo: {multa.organismoTransito ?? "—"}
                            </span>
                            <span>Fecha: {multa.fechaComparendo ?? "—"}</span>
                            {multa.numeroResolucion && (
                              <span>Resolución: {multa.numeroResolucion}</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Seccion>
          )}

          {vehiculo && (
            <Seccion
              icon={Car01Icon}
              titulo={`RUNT · Vehículo ${runtPlaca?.placa ?? ""}`}
              badge={
                <Badge variant="secondary">
                  {String(vehiculo["estadoAutomotor"] ?? "—")}
                </Badge>
              }
            >
              <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                <Dato label="Marca" value={String(vehiculo["marca"] ?? "")} />
                <Dato label="Línea" value={String(vehiculo["linea"] ?? "")} />
                <Dato label="Modelo" value={String(vehiculo["modelo"] ?? "")} />
                <Dato label="Clase" value={String(vehiculo["clase"] ?? "")} />
                <Dato label="Color" value={String(vehiculo["color"] ?? "")} />
                <Dato
                  label="Servicio"
                  value={String(vehiculo["tipoServicio"] ?? "")}
                />
                <Dato
                  label="Cilindraje"
                  value={String(vehiculo["cilindraje"] ?? "")}
                />
                <Dato
                  label="Organismo"
                  value={String(vehiculo["organismoTransito"] ?? "")}
                />
              </div>
            </Seccion>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Seccion icon={Building02Icon} titulo="RUES · Mercantil">
              <p className="text-sm text-muted-foreground">
                {rues?.total
                  ? `${rues.total} registro(s) encontrados.`
                  : "Sin registros mercantiles."}
              </p>
            </Seccion>

            <Seccion icon={UserCircleIcon} titulo="RUNT · Licencias">
              <p className="text-sm text-muted-foreground">
                {consulta.result.resultado_runt_ciudadano?.licencias?.length
                  ? `${consulta.result.resultado_runt_ciudadano.licencias.length} licencia(s).`
                  : "Sin licencias registradas."}
              </p>
            </Seccion>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Consulta realizada el {consulta.fecha_consulta}
          </p>
        </div>
      )}
    </Dialog>
  )
}
