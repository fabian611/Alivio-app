import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { LinkButton } from "@/components/ui/button"

export function StatusScreen({
  icon,
  code,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: IconSvgElement
  code: string
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} size={24} />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-widest text-muted-foreground">
          {code}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-sm text-sm text-balance text-muted-foreground">
          {description}
        </p>
      </div>
      <LinkButton href={actionHref}>{actionLabel}</LinkButton>
    </div>
  )
}
