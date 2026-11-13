"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function LiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    let socket: WebSocket | null = null
    let closed = false
    let wait = 1000
    let timer: ReturnType<typeof setTimeout> | undefined

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      socket = new WebSocket(`${protocol}//${window.location.host}/live`)
      socket.onopen = () => {
        wait = 1000
      }
      socket.onmessage = () => {
        router.refresh()
      }
      socket.onclose = () => {
        if (closed) return
        timer = setTimeout(connect, wait)
        wait = Math.min(wait * 2, 15000)
      }
    }

    connect()
    return () => {
      closed = true
      if (timer) clearTimeout(timer)
      socket?.close()
    }
  }, [router])

  return null
}
