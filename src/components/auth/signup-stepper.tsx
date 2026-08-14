import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Identité" },
  { label: "Téléphone" },
  { label: "OTP" },
  { label: "Mot de passe" },
]

export function SignupStepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-start">
      {STEPS.map((step, index) => {
        const active = index === current
        const done = index < current
        return (
          <li key={step.label} className="flex flex-1 items-start">
            <div className="flex min-w-0 flex-col items-center">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-foreground text-background",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-16 text-center text-[10px] font-medium tracking-wide uppercase sm:max-w-none sm:text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mt-4 h-px flex-1",
                  done ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
