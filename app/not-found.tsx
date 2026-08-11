import { SearchList01Icon } from "@hugeicons/core-free-icons"
import type { Metadata } from "next"

import { StatusScreen } from "@/components/status-screen"

export const metadata: Metadata = {
  title: "Página no encontrada",
}

export default function NotFound() {
  return (
    <StatusScreen
      icon={SearchList01Icon}
      code="404"
      title="Página no encontrada"
      description="La página que buscas no existe o fue movida."
      actionHref="/"
      actionLabel="Ir a mi panel"
    />
  )
}
