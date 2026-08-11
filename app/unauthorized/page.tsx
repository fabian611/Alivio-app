import { ShieldUserIcon } from "@hugeicons/core-free-icons"
import type { Metadata } from "next"

import { StatusScreen } from "@/components/status-screen"
import { requireUser } from "@/lib/dal"
import { homeFor, ROLE_LABEL } from "@/lib/roles"

export const metadata: Metadata = {
  title: "Sin permisos",
}

export default async function UnauthorizedPage() {
  const user = await requireUser()

  return (
    <StatusScreen
      icon={ShieldUserIcon}
      code="403"
      title="No tienes permisos"
      description={`Tu rol de ${ROLE_LABEL[user.role].toLowerCase()} no tiene acceso a esta sección. Si crees que es un error, contacta al administrador.`}
      actionHref={homeFor(user.role)}
      actionLabel="Volver a mi panel"
    />
  )
}
