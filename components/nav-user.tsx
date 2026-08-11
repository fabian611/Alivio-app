"use client"

import { Logout03Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/actions/auth"
import { ROLE_LABEL, type Role } from "@/lib/roles"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function NavUser({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: Role
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton size="lg" tooltip={name}>
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md text-xs">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="grid flex-1 text-start leading-tight">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {ROLE_LABEL[role]}
              </span>
            </span>
            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
          </SidebarMenuButton>

          <DropdownMenu placement="top start" className="min-w-56">
            <DropdownMenuLabel className="grid leading-tight">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onAction={() => {
                void logout()
              }}
            >
              <HugeiconsIcon icon={Logout03Icon} size={16} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
