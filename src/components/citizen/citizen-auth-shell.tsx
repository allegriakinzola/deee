import Link from "next/link"
import type { ReactNode } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Logo } from "@/components/brand/logo"
import { CitizenStage } from "@/components/citizen/citizen-stage"

export function CitizenAuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <>
      <div className="lg:hidden">
        <CitizenStage>
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <header className="shrink-0 px-5 pt-[max(0.7rem,env(safe-area-inset-top))]">
              <div className="flex items-center justify-between">
                <Logo />
                <Link
                  href="/"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Accueil
                </Link>
              </div>
            </header>
            <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-6">
              <h1 className="text-[1.65rem] font-semibold tracking-tight text-zinc-900">
                {title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">
                {description}
              </p>
              <div className="mt-6">{children}</div>
            </main>
          </div>
        </CitizenStage>
      </div>
      <div className="hidden min-h-full flex-1 lg:flex">
        <AuthShell title={title} description={description}>
          {children}
        </AuthShell>
      </div>
    </>
  )
}
