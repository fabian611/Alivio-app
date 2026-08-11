import Image from "next/image"

import { cn } from "@/lib/utils"

export function LoadingScreen({
  label = "Cargando...",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-5",
        className
      )}
    >
      <Image
        src="/logo.jpeg"
        alt=""
        width={327}
        height={290}
        priority
        className="h-14 w-auto animate-pulse"
      />

      <span className="h-1 w-40 overflow-hidden rounded-full bg-brand-ink/10">
        <span className="block h-full w-1/3 animate-[loading-sweep_1.1s_ease-in-out_infinite] rounded-full bg-brand-orange" />
      </span>

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
