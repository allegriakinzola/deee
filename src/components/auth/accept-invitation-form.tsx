"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

const MIN_PASSWORD_LENGTH = 10

export function AcceptInvitationForm({
  token,
  defaultName,
}: {
  token: string
  defaultName: string
}) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(defaultName)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`)
      return
    }

    if (password !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setPending(true)

    const result = await postJson<{ redirectTo: string }>(
      "/api/v1/auth/invitation/accept",
      { token, displayName, password, passwordConfirm }
    )

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
      <Field label="Nom" htmlFor="accept-name">
        <Input
          id="accept-name"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field
        label="Mot de passe"
        htmlFor="accept-password"
        hint={`Au moins ${MIN_PASSWORD_LENGTH} caractères.`}
      >
        <PasswordInput
          id="accept-password"
          name="password"
          autoComplete="new-password"
          value={password}
          visible={showPassword}
          onVisibleChange={setShowPassword}
          onChange={setPassword}
        />
      </Field>
      <Field label="Confirmer le mot de passe" htmlFor="accept-password-confirm">
        <PasswordInput
          id="accept-password-confirm"
          name="passwordConfirm"
          autoComplete="new-password"
          value={passwordConfirm}
          visible={showPassword}
          onVisibleChange={setShowPassword}
          onChange={setPasswordConfirm}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl text-base"
      >
        {pending ? "Enregistrement…" : "Activer mon compte"}
        <ArrowRightIcon className="size-4" />
      </Button>
    </form>
  )
}

function PasswordInput({
  id,
  name,
  autoComplete,
  value,
  visible,
  onVisibleChange,
  onChange,
}: {
  id: string
  name: string
  autoComplete: string
  value: string
  visible: boolean
  onVisibleChange: (value: boolean) => void
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-12"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        onClick={() => onVisibleChange(!visible)}
      >
        {visible ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  )
}
