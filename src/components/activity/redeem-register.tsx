"use client"

import { type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DirectoryRedeem } from "@/modules/redeems"
import type {
  RedeemRegisterResult,
  RedeemStatusFilter,
} from "@/modules/redeems/list-register"

const FILTERS = [
  { id: "ALL", label: "Tous" },
  { id: "SENT", label: "Envoyés" },
  { id: "CONFIRMED", label: "Confirmés" },
  { id: "REJECTED", label: "Refusés" },
] as const

const STATUS_LABEL = {
  SENT: "Envoyé",
  CONFIRMED: "Confirmé",
  REJECTED: "Refusé",
} as const

function when(redeem: DirectoryRedeem) {
  return redeem.confirmedAt ?? redeem.rejectedAt ?? redeem.sentAt
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kinshasa",
  }).format(new Date(iso))
}

function bonLabel(count: number) {
  return `${count} ${count === 1 ? "bon" : "bons"}`
}

function hrefFor(
  pathname: string,
  current: { status: RedeemStatusFilter; q: string },
  next: { status?: RedeemStatusFilter; q?: string; page?: number }
) {
  const status = next.status ?? current.status
  const q = next.q ?? current.q
  const page = next.page ?? 1
  const params = new URLSearchParams()
  if (status !== "ALL") {
    params.set("status", status)
  }
  if (q) {
    params.set("q", q)
  }
  if (page > 1) {
    params.set("page", String(page))
  }
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

function pageWindow(current: number, count: number) {
  const start = Math.max(1, Math.min(current - 2, count - 4))
  const end = Math.min(count, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export function RedeemRegister({
  eyebrow,
  description,
  register,
  showPartner,
}: {
  eyebrow: string
  description: string
  register: RedeemRegisterResult
  showPartner: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const columns = showPartner ? 7 : 6
  const from =
    register.total === 0 ? 0 : (register.page - 1) * register.pageSize + 1
  const to = Math.min(register.page * register.pageSize, register.total)
  const pages = pageWindow(register.page, register.pageCount)

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get("q") ?? "")
    router.push(hrefFor(pathname, register, { q, page: 1 }))
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Échanges</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => {
              const active = register.status === item.id
              return (
                <Link
                  key={item.id}
                  href={hrefFor(pathname, register, {
                    status: item.id,
                    page: 1,
                  })}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label} · {register.counts[item.id]}
                </Link>
              )
            })}
          </div>
          <form onSubmit={onSearch} className="relative w-full lg:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              key={register.q}
              name="q"
              defaultValue={register.q}
              placeholder="Citoyen, offre ou shop"
              className="h-9 pl-9"
              aria-label="Rechercher un échange"
            />
          </form>
        </div>

        <DirectoryTableScroll>
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Citoyen
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Offre
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Shop
                </th>
                {showPartner ? (
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                    Partenaire
                  </th>
                ) : null}
                <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                  Valeur
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {register.redeems.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    Aucun échange dans cette sélection.
                  </td>
                </tr>
              ) : (
                register.redeems.map((redeem) => {
                  const place = [redeem.shopArea, displayShopCode(redeem.shopCode)]
                    .filter(Boolean)
                    .join(" · ")
                  return (
                    <tr
                      key={redeem.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                        {formatWhen(when(redeem))}
                      </td>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                        {redeem.citizenName}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {redeem.rewardLabel}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <p>{redeem.shopName}</p>
                        {place ? (
                          <p className="text-xs text-muted-foreground">
                            {place}
                          </p>
                        ) : null}
                      </td>
                      {showPartner ? (
                        <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                          {redeem.partnerName ?? "—"}
                        </td>
                      ) : null}
                      <td className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums">
                        <p className="font-medium">
                          {bonLabel(redeem.bons)} · {redeem.points} pts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatUsd(redeem.usdValue)}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge
                          variant={
                            redeem.status === "CONFIRMED"
                              ? "default"
                              : redeem.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {STATUS_LABEL[redeem.status]}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </DirectoryTableScroll>

        <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {register.total === 0
              ? "0 échange"
              : `${from}–${to} sur ${register.total}`}
          </p>
          <nav className="flex items-center gap-1" aria-label="Pages">
            <PageLink
              href={hrefFor(pathname, register, { page: register.page - 1 })}
              disabled={register.page <= 1}
              label="Page précédente"
            >
              <ChevronLeftIcon className="size-4" />
            </PageLink>
            {pages.map((page) => (
              <Link
                key={page}
                href={hrefFor(pathname, register, { page })}
                aria-current={page === register.page ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm",
                  page === register.page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {page}
              </Link>
            ))}
            <PageLink
              href={hrefFor(pathname, register, { page: register.page + 1 })}
              disabled={register.page >= register.pageCount}
              label="Page suivante"
            >
              <ChevronRightIcon className="size-4" />
            </PageLink>
          </nav>
        </div>
      </section>
    </div>
  )
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: ReactNode
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-40"
      >
        {children}
        <span className="sr-only">{label}</span>
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
    >
      {children}
    </Link>
  )
}
