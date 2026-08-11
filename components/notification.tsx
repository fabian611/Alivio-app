"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "warning" | "info"

const TYPE_STYLES: Record<
  NotificationType,
  { media: string; icon: IconSvgElement }
> = {
  success: {
    media: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: CheckmarkCircle02Icon,
  },
  error: {
    media: "bg-destructive/10 text-destructive",
    icon: MultiplicationSignCircleIcon,
  },
  warning: {
    media: "bg-brand-orange/15 text-brand-orange",
    icon: Alert02Icon,
  },
  info: {
    media: "bg-brand-navy/10 text-brand-navy dark:text-foreground",
    icon: InformationCircleIcon,
  },
}

export type NotificationProps = {
  isOpen: boolean
  type?: NotificationType
  title?: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: "primary" | "danger"
  loading?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

export function Notification({
  isOpen,
  type = "info",
  title = "Notificación",
  message,
  confirmLabel = "Ok",
  cancelLabel,
  confirmTone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: NotificationProps) {
  const style = TYPE_STYLES[type]
  const dismiss = onCancel ?? onConfirm

  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) dismiss()
      }}
      className="sm:max-w-md"
    >
      

      <AlertDialogHeader>
        <AlertDialogMedia className={cn("rounded-full", style.media)}>
          <HugeiconsIcon icon={style.icon} strokeWidth={2} />
        </AlertDialogMedia>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription className="[&_strong]:font-semibold [&_strong]:text-foreground">
          {message}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        {cancelLabel && (
          <Button variant="outline" isDisabled={loading} onPress={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button
          autoFocus
          isDisabled={loading}
          onPress={onConfirm}
          variant={confirmTone === "danger" ? "destructive" : "default"}
        >
          {loading && (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={14}
              className="animate-spin"
            />
          )}
          {confirmLabel}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  )
}
