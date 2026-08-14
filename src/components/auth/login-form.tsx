"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const created = searchParams.get("created") === "1"
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!phone.trim() || !password.trim()) {
      setError("Indiquez votre numéro et votre mot de passe.")
      return
    }
    setError("")
    router.push("/connexion")
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {created ? (
        <p className="flex items-start gap-2.5 rounded-2xl bg-primary/35 px-4 py-3.5 text-sm leading-relaxed">
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          Votre compte a été créé. Connectez-vous avec votre numéro et votre mot
          de passe.
        </p>
      ) : null}

      <Field label="Numéro de téléphone" htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+243 81 000 00 00"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="pr-12"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="h-12 w-full rounded-2xl text-base">
        Se connecter
        <ArrowRightIcon className="size-4" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
