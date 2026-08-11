"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { Notification, type NotificationType } from "@/components/notification"

type NotifyOptions = {
  type?: NotificationType
  title?: string
  message: ReactNode
  confirmLabel?: string
}

type ConfirmOptions = {
  type?: NotificationType
  title?: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: "primary" | "danger"
  onConfirm: () => Promise<void> | void
}

type DialogState =
  | ({ mode: "notify" } & NotifyOptions)
  | ({ mode: "confirm" } & ConfirmOptions)

type NotificationContextValue = {
  notify: (options: NotifyOptions) => void
  success: (message: ReactNode, title?: string) => void
  error: (message: ReactNode, title?: string) => void
  confirm: (options: ConfirmOptions) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification debe usarse dentro de NotificationProvider")
  }

  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null)
  const [loading, setLoading] = useState(false)

  const close = useCallback(() => {
    setState(null)
    setLoading(false)
  }, [])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify: (options) => setState({ mode: "notify", ...options }),
      success: (message, title = "Operación exitosa") =>
        setState({ mode: "notify", type: "success", title, message }),
      error: (message, title = "Algo salió mal") =>
        setState({ mode: "notify", type: "error", title, message }),
      confirm: (options) => setState({ mode: "confirm", ...options }),
    }),
    []
  )

  async function handleConfirm() {
    if (state?.mode !== "confirm") {
      close()
      return
    }

    setLoading(true)

    try {
      await state.onConfirm()
      close()
    } catch {
      setLoading(false)
    }
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <Notification
        isOpen={state !== null}
        type={state?.type ?? "info"}
        title={state?.title}
        message={state?.message ?? ""}
        loading={loading}
        confirmLabel={
          state?.confirmLabel ?? (state?.mode === "confirm" ? "Confirmar" : "Ok")
        }
        cancelLabel={
          state?.mode === "confirm" ? (state.cancelLabel ?? "Cancelar") : undefined
        }
        confirmTone={state?.mode === "confirm" ? state.confirmTone : "primary"}
        onConfirm={handleConfirm}
        onCancel={state?.mode === "confirm" ? close : undefined}
      />
    </NotificationContext.Provider>
  )
}
