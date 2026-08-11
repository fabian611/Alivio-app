import { SidebarProvider } from "@/components/ui/sidebar"

export default function BandejaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "34rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  )
}
