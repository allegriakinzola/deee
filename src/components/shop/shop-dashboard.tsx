import Link from "next/link"

import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RankChart } from "@/components/dashboard/rank-chart"
import { ShareChart } from "@/components/dashboard/share-chart"
import { ShopCodePanel } from "@/components/shop/shop-code-panel"
import { ShopReportDownloadButton } from "@/components/shop/shop-report-download"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDateTimeKinshasa } from "@/lib/period"
import { formatUsd } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { ShopDashboard } from "@/modules/shops"

function phrase(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function FlowBar({
  parts,
}: {
  parts: Array<{ label: string; value: number; color: string }>
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  return (
    <div>
      <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-muted p-0.5">
        {total === 0
          ? null
          : parts.map((part) =>
              part.value === 0 ? null : (
                <div
                  key={part.label}
                  className="rounded-full"
                  style={{
                    flexGrow: part.value,
                    background: part.color,
                  }}
                />
              )
            )}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: part.color }}
              />
              {part.label}
            </span>
            <span className="font-medium">{part.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MetricLink({
  href,
  label,
  value,
  hint,
  tone = "plain",
}: {
  href: string
  label: string
  value: string
  hint: string
  tone?: "lead" | "plain" | "alert"
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl px-5 py-5 ring-1",
        tone === "lead" && "bg-primary text-primary-foreground ring-primary",
        tone === "plain" && "bg-card ring-foreground/10",
        tone === "alert" && "bg-amber-50 ring-amber-200"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium tracking-wide uppercase",
          tone === "lead" ? "text-primary-foreground/75" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p
        className={cn(
          "mt-2 text-sm",
          tone === "lead" ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
      >
        {hint}
      </p>
    </Link>
  )
}

export function ShopDashboardView({
  shopName,
  partnerName,
  shopCode,
  displayName,
  data,
}: {
  shopName: string
  partnerName: string | null
  shopCode: string | null
  displayName: string
  data: ShopDashboard
}) {
  const waiting = data.pendingDeposits + data.pendingRedeems

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
            {partnerName ?? "Espace shop"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Bonjour, {displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {shopName}. Les indicateurs portent sur 30 jours. Le graphique
            d’activité remonte jusqu’à un an.
          </p>
        </div>
        <ShopReportDownloadButton />
      </div>

      {shopCode ? <ShopCodePanel code={shopCode} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricLink
          href="/shop/depots"
          label="Points collectés"
          value={String(data.pointsCredited30)}
          hint={phrase(
            data.confirmedDeposits30,
            "dépôt confirmé",
            "dépôts confirmés"
          )}
          tone="lead"
        />
        <MetricLink
          href="/shop/echanges"
          label="Valeur remise"
          value={formatUsd(data.usd30)}
          hint={
            data.bons30 === 1
              ? "1 bon confirmé"
              : `${data.bons30} bons confirmés`
          }
        />
        <MetricLink
          href="/shop/depots"
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${phrase(data.rejectedDeposits30, "refusé", "refusés")} sur 30 jours`}
        />
        <MetricLink
          href="/shop/depots"
          label="À traiter au comptoir"
          value={String(waiting)}
          hint={`${phrase(data.pendingDeposits, "dépôt", "dépôts")} · ${phrase(data.pendingRedeems, "échange", "échanges")}`}
          tone={waiting > 0 ? "alert" : "plain"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/shop/echanges"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Échanges confirmés</p>
          <p className="mt-1 text-lg font-semibold">{data.confirmedRedeems30}</p>
        </Link>
        <Link
          href="/shop/echanges"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Points remis</p>
          <p className="mt-1 text-lg font-semibold">{data.pointsDebited30}</p>
        </Link>
        <Link
          href="/shop/depots"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Refus</p>
          <p className="mt-1 text-lg font-semibold">
            {data.rejectedDeposits30 + data.rejectedRedeems30}
          </p>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-5">
          <ActivityChart points={data.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ce qui entre au comptoir</CardTitle>
            <CardDescription>Quantités confirmées sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart
              items={data.topMaterials.map((item) => ({
                label: item.name,
                value: item.quantity,
                detail: `${item.quantity} · ${item.points} pts`,
              }))}
              empty="Aucun dépôt confirmé sur la période."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ce qui est remis</CardTitle>
            <CardDescription>Échanges confirmés sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ShareChart
              center="échanges"
              items={data.rewards.map((item) => ({
                label: item.label,
                value: item.count,
              }))}
              empty="Aucun échange confirmé sur la période."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépôts</CardTitle>
            <CardDescription>En attente, confirmés et refusés</CardDescription>
          </CardHeader>
          <CardContent>
            <FlowBar
              parts={[
                {
                  label: "En attente",
                  value: data.pendingDeposits,
                  color: "oklch(0.72 0.12 85)",
                },
                {
                  label: "Confirmés",
                  value: data.confirmedDeposits30,
                  color: "oklch(0.46 0.11 152)",
                },
                {
                  label: "Refusés",
                  value: data.rejectedDeposits30,
                  color: "oklch(0.62 0.16 25)",
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Échanges</CardTitle>
            <CardDescription>En attente, confirmés et refusés</CardDescription>
          </CardHeader>
          <CardContent>
            <FlowBar
              parts={[
                {
                  label: "En attente",
                  value: data.pendingRedeems,
                  color: "oklch(0.72 0.12 85)",
                },
                {
                  label: "Confirmés",
                  value: data.confirmedRedeems30,
                  color: "oklch(0.46 0.11 152)",
                },
                {
                  label: "Refusés",
                  value: data.rejectedRedeems30,
                  color: "oklch(0.62 0.16 25)",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dernières opérations</CardTitle>
          <CardDescription>
            Confirmations et refus récents de ce shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pas encore d’historique sur 30 jours.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Citoyen</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">
                    Opération
                  </th>
                  <th className="hidden pb-2 font-medium md:table-cell">Quand</th>
                  <th className="pb-2 text-right font-medium">Points</th>
                  <th className="pb-2 text-right font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="py-2.5">
                      <p>{item.citizenName}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {item.kind === "deposit" ? "Dépôt" : item.title}
                      </p>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      {item.kind === "deposit" ? "Dépôt" : item.title}
                    </td>
                    <td className="hidden py-2.5 text-muted-foreground md:table-cell">
                      {formatDateTimeKinshasa(new Date(item.at))}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {item.points}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant={
                          item.status === "CONFIRMED" ? "default" : "secondary"
                        }
                      >
                        {item.status === "CONFIRMED" ? "Confirmé" : "Refusé"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
