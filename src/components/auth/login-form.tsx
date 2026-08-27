"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!identifier.trim() || !password) {
      setError("Indiquez votre e-mail et votre mot de passe.")
      return
    }

    setError("")
    setPending(true)

    const result = await postJson<{ redirectTo: string }>("/api/v1/auth/login", {
      identifier,
      password,
    })

    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    router.push(result.data.redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="E-mail" htmlFor="identifier">
        <Input
          id="identifier"
          name="identifier"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
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

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl text-base"
      >
        {pending ? "Connexion…" : "Se connecter"}
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
