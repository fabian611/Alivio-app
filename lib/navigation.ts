import {
  Analytics01Icon,
  Building02Icon,
  DashboardSquare01Icon,
  History,
  Inbox,
  InboxCheckIcon,
  Invoice01Icon,
  MoneyBag02Icon,
  SearchList01Icon,
  TaskEdit01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { ROLE_HOME, type Role } from "@/lib/roles"

export type NavItem = {
  title: string
  href: string
  icon: IconSvgElement
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  admin: [
    {
      label: "General",
      items: [
        {
          title: "Panel",
          href: ROLE_HOME.admin,
          icon: DashboardSquare01Icon,
        },
      ],
    },
    {
      label: "Administración",
      items: [
        {
          title: "Usuarios",
          href: `${ROLE_HOME.admin}/usuarios`,
          icon: UserGroupIcon,
        },
        {
          title: "Compañías",
          href: `${ROLE_HOME.admin}/companias`,
          icon: Building02Icon,
        },
      ],
    },
  ],
  negociador: [
    {
      label: "General",
      items: [
        {
          title: "Panel",
          href: ROLE_HOME.negociador,
          icon: DashboardSquare01Icon,
        },
      ],
    },
    {
      label: "Negociación",
      items: [
        {
          title: "bandeja de créditos",
          href: `${ROLE_HOME.negociador}/bandeja`,
          icon: InboxCheckIcon,
        },
        {
          title: "Historial",
          href: `${ROLE_HOME.negociador}/historial`,
          icon: History,
        },
      ],
    },
  ],
  gestor: [
    {
      label: "General",
      items: [
        {
          title: "Panel",
          href: ROLE_HOME.gestor,
          icon: DashboardSquare01Icon,
        },
      ],
    },
    {
      label: "Gestión",
      items: [
        {
          title: "Cartera",
          href: `${ROLE_HOME.gestor}/cartera`,
          icon: Analytics01Icon,
        },
        {
          title: "Tratamientos",
          href: `${ROLE_HOME.gestor}/tratamientos`,
          icon: TaskEdit01Icon,
        },
      ],
    },
  ],
}

export function navFor(role: Role): NavSection[] {
  return NAV_BY_ROLE[role]
}
