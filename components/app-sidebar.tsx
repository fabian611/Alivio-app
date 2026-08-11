"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navFor } from "@/lib/navigation"
import { homeFor, ROLE_LABEL, type Role } from "@/lib/roles"

export function AppSidebar({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: Role
}) {  
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" href={homeFor(role)}>
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
                <span className="truncate font-semibold">WANT N&apos; GET</span>
                <span className="truncate text-xs text-muted-foreground">
                  {ROLE_LABEL[role]}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navFor(role).map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      href={item.href}
                      tooltip={item.title}
                      isActive={
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      }
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
        <NavUser name={name} email={email} role={role} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
