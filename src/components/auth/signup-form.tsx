"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

export function SignupForm() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<{ email: string; emailed: boolean } | null>(
    null
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const result = await postJson<{ email: string; emailed: boolean }>(
      "/api/v1/auth/register",
      { displayName, email }
    )

    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setDone(result.data)
  }

  if (done) {
    return (
      <div className="space-y-6">
        <p className="flex items-start gap-2.5 rounded-2xl bg-primary/35 px-4 py-3.5 text-sm leading-relaxed">
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          {done.emailed ? (
            <span>
              Un e-mail d’activation a été envoyé à{" "}
              <strong>{done.email}</strong>. Ouvrez le lien, puis choisissez
              votre mot de passe.
            </span>
          ) : (
            <span>
              Le compte est enregistré, mais l’e-mail n’a pas pu partir.
              Réessayez dans un instant depuis ce formulaire.
            </span>
          )}
        </p>
        {done.emailed ? (
          <p className="text-center text-sm text-muted-foreground">
            Déjà activé ?{" "}
            <Link
              href="/connexion"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        ) : (
          <Button
            type="button"
            className="h-12 w-full rounded-2xl text-base"
            onClick={() => setDone(null)}
          >
            Réessayer
            <ArrowRightIcon className="size-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Nom" htmlFor="signup-name">
        <Input
          id="signup-name"
          name="displayName"
          autoComplete="name"
          placeholder="Ex. Jean Mukendi"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </Field>
      <Field
        label="E-mail"
        htmlFor="signup-email"
        hint="Vous recevrez un lien d’activation sur cette adresse."
      >
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl text-base"
      >
        {pending ? "Envoi…" : "Recevoir le lien d’activation"}
        <ArrowRightIcon className="size-4" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  )
}
