"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function LiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    const source = new EventSource("/api/v1/live")
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string }
        if (payload.type && payload.type !== "live.ready") {
          router.refresh()
        }
      } catch {
        router.refresh()
      }
    }
    return () => {
      source.close()
    }
  }, [router])

  return null
}
