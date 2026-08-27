import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function IphoneFrame({
  className,
  children,
  label,
}: {
  className?: string
  children: ReactNode
  label?: string
}) {
  return (
    <div
      className={cn("iphone", className)}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <span className="iphone-silent" />
      <span className="iphone-vol-up" />
      <span className="iphone-vol-down" />
      <span className="iphone-power" />

      <div className="iphone-body">
        <div className="iphone-screen">
          <div className="iphone-island">
            <span className="iphone-camera" />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function IphoneStatusBar() {
  return (
    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-800">
      <span>9:41</span>
      <span className="flex items-center gap-0.5">
        <Signal />
        <Wifi />
        <Battery />
      </span>
    </div>
  )
}

function Signal() {
  return (
    <svg viewBox="0 0 16 12" className="h-2.5 w-3.5" fill="currentColor">
      <rect x="0" y="8" width="2.2" height="4" rx="0.4" />
      <rect x="4.2" y="5.5" width="2.2" height="6.5" rx="0.4" />
      <rect x="8.4" y="3" width="2.2" height="9" rx="0.4" />
      <rect x="12.6" y="0" width="2.2" height="12" rx="0.4" />
    </svg>
  )
}

function Wifi() {
  return (
    <svg
      viewBox="0 0 16 12"
      className="h-2.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M1.5 4.2c3.6-3.2 9.4-3.2 13 0" />
      <path d="M4 6.8c2.3-2 5.7-2 8 0" />
      <circle cx="8" cy="10.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Battery() {
  return (
    <svg viewBox="0 0 22 12" className="h-2.5 w-[18px]" fill="none">
      <rect
        x="0.6"
        y="1.2"
        width="18"
        height="9.6"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="2.2" y="2.8" width="14.2" height="6.4" rx="1" fill="currentColor" />
      <rect x="19.4" y="4" width="2" height="4" rx="0.6" fill="currentColor" />
    </svg>
  )
}
