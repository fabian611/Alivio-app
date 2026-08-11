"use client"

import { useActionState, useState } from "react"
import Image from "next/image"
import {
  Alert02Icon,
  Cancel01Icon,
  Loading03Icon,
  Mail01Icon,
  PencilEdit01Icon,
  Shield01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { login, type LoginState } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"

const INITIAL_STATE: LoginState = {}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputBase =
  "h-12 w-full rounded-[10px] border-[1.2px] bg-background pl-11 pr-11 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground dark:bg-input/30"
const inputNormal =
  "border-input focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
const inputError =
  "border-destructive bg-destructive/10 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
const primaryButton =
  "flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-orange text-base font-semibold text-brand-navy shadow-sm transition hover:bg-brand-orange-hover disabled:opacity-50"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(login, INITIAL_STATE)
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [localEmailError, setLocalEmailError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const emailError = localEmailError ?? state.fieldErrors?.email?.[0]
  const passwordError = state.fieldErrors?.password?.[0]

  function handleContinue() {
    const value = email.trim()

    if (!value) {
      setLocalEmailError("Ingresa tu correo electrónico.")
      return
    }

    if (!EMAIL_PATTERN.test(value)) {
      setLocalEmailError("Ingresa un correo válido.")
      return
    }

    setLocalEmailError(null)
    setStep(2)
  }

  function handleEditEmail() {
    setStep(1)
    setShowPassword(false)
  }

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (step !== 2) {
          event.preventDefault()
          handleContinue()
        }
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <Image
        src="/logo.jpeg"
        alt="WANT N' GET"
        width={327}
        height={290}
        priority
        className="h-16 w-auto self-start"
      />

      {state.message && (
        <div className="flex items-start gap-3 rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={18}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm font-medium text-destructive">{state.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-left text-2xl font-semibold tracking-tight text-foreground">
          Inicia sesión en WANT N&apos; GET
        </h1>
        <p className="text-left text-base font-medium text-muted-foreground">
          {step === 1
            ? "Ingresa tu correo para continuar"
            : "Ingresa tu contraseña"}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-foreground"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              size={20}
              className={cn(
                "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition",
                emailError
                  ? "text-destructive"
                  : step === 2
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground"
              )}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Ingresa tu correo"
              autoFocus={step === 1}
              readOnly={step === 2}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setLocalEmailError(null)
              }}
              onKeyDown={(event) => {
                if (step === 1 && event.key === "Enter") {
                  event.preventDefault()
                  handleContinue()
                }
              }}
              className={cn(
                inputBase,
                step === 2 &&
                  "border-input bg-muted/50 text-muted-foreground",
                emailError ? inputError : step === 1 && inputNormal
              )}
            />
            {step === 1 && email && (
              <button
                type="button"
                onClick={() => {
                  setEmail("")
                  setLocalEmailError(null)
                }}
                aria-label="Limpiar correo"
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={handleEditEmail}
                aria-label="Editar correo"
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition hover:text-brand-orange"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
              </button>
            )}
          </div>
          {emailError && (
            <p className="text-sm font-medium text-destructive">{emailError}</p>
          )}
        </div>

        {step === 2 && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Contraseña
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={20}
                className={cn(
                  "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition",
                  passwordError ? "text-destructive" : "text-muted-foreground"
                )}
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                autoFocus
                className={cn(
                  inputBase,
                  passwordError ? inputError : inputNormal
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className={cn(
                  "absolute top-1/2 right-3.5 -translate-y-1/2 transition",
                  passwordError
                    ? "text-destructive hover:text-destructive/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  size={20}
                />
              </button>
            </div>
            {passwordError && (
              <p className="text-sm font-medium text-destructive">
                {passwordError}
              </p>
            )}
          </div>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={handleContinue}
            className={primaryButton}
          >
            Continuar
          </button>
        ) : (
          <button type="submit" disabled={pending} className={primaryButton}>
            {pending ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={18}
                  className="mr-2 animate-spin"
                />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        )}
      </div>

 
    </form>
  )
}
