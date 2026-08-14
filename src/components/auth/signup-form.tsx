"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState, type KeyboardEvent } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { SignupStepper } from "@/components/auth/signup-stepper"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FormState = {
  nom: string
  prenom: string
  postNom: string
  phone: string
  otp: string[]
  password: string
  confirm: string
}

const INITIAL: FormState = {
  nom: "",
  prenom: "",
  postNom: "",
  phone: "",
  otp: ["", "", "", "", "", ""],
  password: "",
  confirm: "",
}

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const phoneHint = useMemo(() => {
    const digits = form.phone.replace(/\D/g, "")
    if (digits.length < 9) return form.phone
    return form.phone
  }, [form.phone])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError("")
  }

  function nextIdentity() {
    if (
      form.nom.trim().length < 2 ||
      form.prenom.trim().length < 2 ||
      form.postNom.trim().length < 2
    ) {
      setError("Renseignez votre nom, prénom et post-nom.")
      return
    }
    setError("")
    setStep(1)
  }

  function nextPhone() {
    const digits = form.phone.replace(/\D/g, "")
    if (digits.length < 9) {
      setError("Indiquez un numéro de téléphone valide.")
      return
    }
    setError("")
    setStep(2)
  }

  function nextOtp() {
    if (form.otp.join("").length !== 6) {
      setError("Saisissez le code à 6 chiffres reçu par SMS.")
      return
    }
    setError("")
    setStep(3)
  }

  function createAccount() {
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (form.password !== form.confirm) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }
    router.push("/connexion?created=1")
  }

  function onOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 1) {
      const next = [...form.otp]
      digits.slice(0, 6).split("").forEach((digit, offset) => {
        if (index + offset < 6) next[index + offset] = digit
      })
      update("otp", next)
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus()
      return
    }
    const digit = digits.slice(-1)
    const next = [...form.otp]
    next[index] = digit
    update("otp", next)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function onOtpKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !form.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div>
      <SignupStepper current={step} />

      {step === 0 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            nextIdentity()
          }}
        >
          <Field label="Nom" htmlFor="nom">
            <Input
              id="nom"
              name="nom"
              autoComplete="family-name"
              placeholder="Ex. Mukendi"
              value={form.nom}
              onChange={(event) => update("nom", event.target.value)}
            />
          </Field>
          <Field label="Prénom" htmlFor="prenom">
            <Input
              id="prenom"
              name="prenom"
              autoComplete="given-name"
              placeholder="Ex. Jean"
              value={form.prenom}
              onChange={(event) => update("prenom", event.target.value)}
            />
          </Field>
          <Field
            label="Post-nom"
            htmlFor="postNom"
            hint="Votre post-nom, comme sur votre pièce d’identité."
          >
            <Input
              id="postNom"
              name="postNom"
              placeholder="Ex. Kabila"
              value={form.postNom}
              onChange={(event) => update("postNom", event.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-2xl text-base">
            Continuer
          </Button>
        </form>
      ) : null}

      {step === 1 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            nextPhone()
          }}
        >
          <Field
            label="Numéro de téléphone"
            htmlFor="signup-phone"
            hint="Vous recevrez un code OTP sur ce numéro."
          >
            <Input
              id="signup-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+243 81 000 00 00"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => setStep(0)}
            >
              Retour
            </Button>
            <Button type="submit" className="h-12 flex-1 rounded-2xl text-base">
              Envoyer le code
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            nextOtp()
          }}
        >
          <div>
            <p className="text-sm font-medium">Code OTP</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Entrez le code envoyé au {phoneHint || "numéro indiqué"}.
            </p>
            <div className="mt-4 flex justify-between gap-2">
              {form.otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Chiffre ${index + 1} du code`}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => onOtpChange(index, event.target.value)}
                  onKeyDown={(event) => onOtpKeyDown(index, event)}
                  className={cn(
                    "h-12 w-full rounded-2xl border border-transparent bg-muted/70 text-center text-lg font-semibold outline-none",
                    "focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                  )}
                />
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => setStep(1)}
            >
              Retour
            </Button>
            <Button type="submit" className="h-12 flex-1 rounded-2xl text-base">
              Confirmer
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            createAccount()
          }}
        >
          <Field
            label="Mot de passe"
            htmlFor="new-password"
            hint="Au moins 8 caractères."
          >
            <div className="relative">
              <Input
                id="new-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-11"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </Field>
          <Field label="Confirmer le mot de passe" htmlFor="confirm-password">
            <Input
              id="confirm-password"
              name="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => update("confirm", event.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={() => setStep(2)}
            >
              Retour
            </Button>
            <Button type="submit" className="h-12 flex-1 rounded-2xl text-base">
              Créer le compte
            </Button>
          </div>
        </form>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
