"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function CitizenLogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onLogout() {
    setPending(true)
    try {
      await postJson("/api/v1/auth/logout")
      router.push("/connexion")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={onLogout}
      className="h-12 w-full rounded-2xl text-base"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  )
}
