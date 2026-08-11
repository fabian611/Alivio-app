"use client"

import { useEffect, useMemo, useState } from "react"
import { CursorPointer01Icon, InboxIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { CuadroNegociacion } from "@/components/bandeja/cuadro-negociacion"
import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { navFor } from "@/lib/navigation"
import { ROLE_LABEL, type Role } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { Credito } from "@/types/credito"

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

function EstadoVacio({
  icono,
  titulo,
  detalle,
}: {
  icono: IconSvgElement
  titulo: string
  detalle: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icono} size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{titulo}</p>
        <p className="max-w-xs text-sm text-balance text-muted-foreground">
          {detalle}
        </p>
      </div>
    </div>
  )
}

function moraTone(dias: number) {
  if (dias === 0) return "bg-emerald-500/10 text-emerald-600"
  if (dias <= 30) return "bg-amber-500/10 text-amber-600"
  if (dias <= 90) return "bg-orange-500/10 text-orange-600"
  return "bg-red-500/10 text-red-600"
}

export function BandejaShell({
  creditos,
  gestionadosPorCredito,
  usuario,
}: {
  creditos: Credito[]
  gestionadosPorCredito: Record<string, number>
  usuario: { name: string; email: string; role: Role }
}) {
  const pathname = usePathname()
  const [seleccionado, setSeleccionado] = useState<Credito | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [gestiones, setGestiones] = useState(gestionadosPorCredito)

  useEffect(() => {
    if (!seleccionado) return

    function esEscritura(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (esEscritura(event.target)) return

      const modalAbierto = document.querySelector(
        "[data-slot=dialog-content], [data-slot=alert-dialog-content]"
      )

      if (modalAbierto) return

      setSeleccionado(null)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [seleccionado])

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) return creditos

    return creditos.filter((credito) =>
      [credito.deudor, credito.nroCredito, credito.pagaduria]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(termino))
    )
  }, [busqueda, creditos])

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      >
        <Sidebar collapsible="none" className="w-64 shrink-0 border-e">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" href="/negociador">
                  <span className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                    <Image
                      src="/logo.jpeg"
                      alt="WANT N' GET"
                      width={327}
                      height={290}
                      className="size-full object-contain"
                    />
                  </span>
                  <span className="grid flex-1 text-start leading-tight">
                    <span className="truncate font-semibold">
                      WANT N&apos; GET
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {ROLE_LABEL[usuario.role]}
                    </span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            {navFor(usuario.role).map((section) => (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          href={item.href}
                          tooltip={item.title}
                          isActive={pathname === item.href}
                        >
                          <HugeiconsIcon icon={item.icon} size={16} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <NavUser
              name={usuario.name}
              email={usuario.email}
              role={usuario.role}
            />
          </SidebarFooter>
        </Sidebar>

        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
          <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="flex w-full items-center justify-between">
              <div className="text-base font-medium text-foreground">
                Bandeja
              </div>
              <span className="text-xs text-muted-foreground">
                {filtrados.length} de {creditos.length}
              </span>
            </div>
            <SidebarInput
              placeholder="Buscar deudor o crédito..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {filtrados.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">
                    Sin resultados.
                  </p>
                ) : (
                  filtrados.map((credito) => {
                    const activo = seleccionado?.id === credito.id
                    const veces = gestiones[credito.id] ?? 0

                    return (
                      <button
                        key={credito.id}
                        type="button"
                        onClick={() => setSeleccionado(credito)}
                        className={cn(
                          "flex w-full flex-col items-start gap-2 border-b p-4 text-start text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          activo && "bg-sidebar-accent"
                        )}
                      >
                        <div className="flex w-full items-center gap-2">
                          <span className="truncate font-medium">
                            {credito.deudor ?? "Sin deudor"}
                          </span>
                          <Badge
                            className={cn(
                              "ms-auto shrink-0 text-[10px]",
                              moraTone(credito.diasMoraAct)
                            )}
                          >
                            {credito.diasMoraAct} d
                          </Badge>
                        </div>

                        <span className="font-mono text-xs text-muted-foreground">
                          {credito.nroCredito}
                        </span>

                        <div className="flex w-full items-center gap-2">
                          <span className="text-xs tabular-nums">
                            {money.format(Number(credito.saldoCapital))}
                          </span>
                          {veces > 0 && (
                            <span className="ms-auto text-[10px] text-muted-foreground">
                              {veces} gestión(es)
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 h-4" />
          <span className="text-sm font-medium">
            {seleccionado?.deudor ?? "Bandeja de créditos"}
          </span>
          {seleccionado && (
            <span className="font-mono text-xs text-muted-foreground">
              {seleccionado.nroCredito}
            </span>
          )}
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {creditos.length === 0 ? (
            <EstadoVacio
              icono={InboxIcon}
              titulo="No tienes créditos asignados"
              detalle="El gestor de tu compañía debe aplicarte un tratamiento para que aparezcan aquí."
            />
          ) : seleccionado ? (
            <CuadroNegociacion
              credito={seleccionado}
              onGuardado={() =>
                setGestiones((current) => ({
                  ...current,
                  [seleccionado.id]: (current[seleccionado.id] ?? 0) + 1,
                }))
              }
            />
          ) : (
            <EstadoVacio
              icono={CursorPointer01Icon}
              titulo="Selecciona un crédito"
              detalle="Elige un crédito de la bandeja para abrir su cuadro de negociación."
            />
          )}
        </main>
      </SidebarInset>
    </>
  )
}
