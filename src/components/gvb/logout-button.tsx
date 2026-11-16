"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function LogoutButton({
  size = "sm",
}: {
  size?: "sm" | "lg"
} = {}) {
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
      size={size}
      disabled={pending}
      onClick={onLogout}
    >
      {pending ? "Déconnexion…" : "Déconnexion"}
    </Button>
  )
}
