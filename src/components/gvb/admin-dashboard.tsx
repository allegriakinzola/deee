import Link from "next/link"

import { cn } from "@/lib/utils"

import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RankChart } from "@/components/dashboard/rank-chart"
import { ShareChart } from "@/components/dashboard/share-chart"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDateTimeKinshasa } from "@/lib/period"
import { formatUsd, usdFromPoints } from "@/lib/money"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog/conversion"
import type { AdminDashboard } from "@/modules/users"

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

export function AdminDashboardView({
  displayName,
  data,
}: {
  displayName: string
  data: AdminDashboard
}) {
  const waiting = data.pendingDeposits + data.pendingRedeems
  const outstandingUsd = formatUsd(
    usdFromPoints(data.pointsOutstanding, DEFAULT_USD_PER_POINT)
  )

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
            Pilotage GVB
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Bonjour, {displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Collecte, points et échanges du réseau DEEE Kinshasa. Les
            indicateurs portent sur 30 jours. Le graphique d’activité remonte
            jusqu’à un an. Le solde des citoyens est le stock actuel.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricLink
          href="/admin/utilisateurs"
          label="Points en circulation"
          value={String(data.pointsOutstanding)}
          hint={`${outstandingUsd} dus aux citoyens`}
          tone="lead"
        />
        <MetricLink
          href="/admin/echanges"
          label="Valeur remise"
          value={formatUsd(data.usd30)}
          hint={
            data.bons30 === 1
              ? "1 bon confirmé"
              : `${data.bons30} bons confirmés`
          }
        />
        <MetricLink
          href="/admin/depots"
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${data.pointsCredited30} pts crédités · ${data.rejectedDeposits30} ${data.rejectedDeposits30 === 1 ? "refusé" : "refusés"}`}
        />
        <MetricLink
          href="/admin/depots"
          label="À traiter dans les shops"
          value={String(waiting)}
          hint={`${data.pendingDeposits === 1 ? "1 dépôt" : `${data.pendingDeposits} dépôts`} · ${data.pendingRedeems === 1 ? "1 échange" : `${data.pendingRedeems} échanges`}`}
          tone={waiting > 0 ? "alert" : "plain"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/admin/partenaires"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Partenaires actifs</p>
          <p className="mt-1 text-lg font-semibold">
            {data.partnersActive}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {data.partners}
            </span>
          </p>
        </Link>
        <Link
          href="/admin/shops"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Shops actifs</p>
          <p className="mt-1 text-lg font-semibold">
            {data.shopsActive}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {data.shops}
            </span>
          </p>
        </Link>
        <Link
          href="/admin/utilisateurs"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Citoyens</p>
          <p className="mt-1 text-lg font-semibold">{data.citizens}</p>
        </Link>
        <Link
          href="/admin/materiels"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="mt-1 text-lg font-semibold">{data.materials}</p>
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
            <CardTitle>Shops qui collectent</CardTitle>
            <CardDescription>Points crédités sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart
              items={data.topShops.map((item) => ({
                label: item.name,
                value: item.points,
                detail: `${item.deposits} dépôt${item.deposits === 1 ? "" : "s"} · ${item.redeems} échange${item.redeems === 1 ? "" : "s"}`,
              }))}
              empty="Aucun dépôt confirmé sur la période."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Partenaires</CardTitle>
            <CardDescription>Dépôts confirmés et valeur remise</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart
              items={data.topPartners.map((item) => ({
                label: item.name,
                value: item.deposits,
                detail: `${item.redeems} échange${item.redeems === 1 ? "" : "s"} · ${formatUsd(item.usd)}`,
              }))}
              empty="Aucune activité confirmée sur la période."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ce qui entre dans le réseau</CardTitle>
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
          <CardDescription>Confirmations et refus récents sur le réseau</CardDescription>
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
                  <th className="hidden pb-2 font-medium md:table-cell">Shop</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">Quand</th>
                  <th className="pb-2 text-right font-medium">Points</th>
                  <th className="pb-2 text-right font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="py-2.5">
                      <p>{item.citizenName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.kind === "deposit" ? "Dépôt" : item.title}
                        {item.partnerName ? ` · ${item.partnerName}` : ""}
                      </p>
                    </td>
                    <td className="hidden py-2.5 md:table-cell">
                      {item.shopName ?? "—"}
                    </td>
                    <td className="hidden py-2.5 text-muted-foreground sm:table-cell">
                      {formatDateTimeKinshasa(new Date(item.at))}
                    </td>
                    <td className="py-2.5 text-right">{item.points}</td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant={item.status === "CONFIRMED" ? "default" : "secondary"}
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
