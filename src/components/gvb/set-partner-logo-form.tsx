"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postForm } from "@/lib/api"
import { PartnerLogoField } from "@/components/gvb/partner-logo-field"
import { Button } from "@/components/ui/button"

export function SetPartnerLogoForm({
  partnerId,
  currentLogo,
  onSaved,
}: {
  partnerId: string
  currentLogo: string | null
  onSaved: () => void
}) {
  const router = useRouter()
  const [logo, setLogo] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const body = new FormData()
    if (logo) {
      body.append("logo", logo)
    }

    const result = await postForm(`/api/v1/partners/${partnerId}/logo`, body)
    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setLogo(null)
    router.refresh()
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <PartnerLogoField
        id="partner-logo-update"
        file={logo}
        currentSrc={currentLogo}
        onChange={setLogo}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Envoi…" : "Enregistrer le logo"}
      </Button>
    </form>
  )
}
