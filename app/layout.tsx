import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { NotificationProvider } from "@/components/notification-provider"
import { AriaRouterProvider } from "@/components/router-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Alivio",
    template: "%s · Alivio",
  },
  description: "Plataforma de gestión y negociación de cartera.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AriaRouterProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AriaRouterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
