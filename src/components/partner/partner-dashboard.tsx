import Link from "next/link"

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
import { formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import { cn } from "@/lib/utils"
import type { PartnerDashboard } from "@/modules/partners"

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

export function PartnerDashboardView({
  displayName,
  partnerName,
  data,
}: {
  displayName: string
  partnerName: string
  data: PartnerDashboard
}) {
  const waiting = data.pendingDeposits + data.pendingRedeems
  const rankedShops = [...data.shopRows].sort((a, b) => b.points30 - a.points30)

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          {partnerName}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Bonjour, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Collecte et échanges de vos shops. Les indicateurs portent sur 30
          jours. Le graphique d’activité remonte jusqu’à un an.
          Les offres se règlent dans{" "}
          <Link
            href="/partenaire/offres"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Offres
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricLink
          href="/partenaire/depots"
          label="Points collectés"
          value={String(data.pointsCredited30)}
          hint={phrase(data.confirmedDeposits30, "dépôt confirmé", "dépôts confirmés")}
          tone="lead"
        />
        <MetricLink
          href="/partenaire/echanges"
          label="Valeur remise"
          value={formatUsd(data.usd30)}
          hint={
            data.bons30 === 1
              ? "1 bon confirmé"
              : `${data.bons30} bons confirmés`
          }
        />
        <MetricLink
          href="/partenaire/depots"
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${phrase(data.rejectedDeposits30, "refusé", "refusés")} sur 30 jours`}
        />
        <MetricLink
          href="/partenaire/depots"
          label="À traiter dans vos shops"
          value={String(waiting)}
          hint={`${phrase(data.pendingDeposits, "dépôt", "dépôts")} · ${phrase(data.pendingRedeems, "échange", "échanges")}`}
          tone={waiting > 0 ? "alert" : "plain"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/partenaire/shops"
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
          href="/partenaire/utilisateurs"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Équipe</p>
          <p className="mt-1 text-lg font-semibold">{data.members}</p>
        </Link>
        <Link
          href="/partenaire/echanges"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Échanges confirmés</p>
          <p className="mt-1 text-lg font-semibold">{data.confirmedRedeems30}</p>
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
              items={rankedShops.map((shop) => ({
                label: shop.name,
                value: shop.points30,
                detail: `${phrase(shop.deposits30, "dépôt", "dépôts")} · ${phrase(shop.redeems30, "échange", "échanges")}`,
              }))}
              empty="Aucun dépôt confirmé sur la période."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ce qui entre dans vos shops</CardTitle>
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

      <Card>
        <CardHeader className="flex flex-row items-end justify-between gap-3">
          <div>
            <CardTitle>Vos shops</CardTitle>
            <CardDescription>Code, responsable et activité sur 30 jours</CardDescription>
          </div>
          <Link
            href="/partenaire/shops"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Gérer
          </Link>
        </CardHeader>
        <CardContent>
          {data.shopRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun shop pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Shop</th>
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 text-right font-medium">Attente</th>
                    <th className="pb-2 text-right font-medium">Dépôts</th>
                    <th className="pb-2 text-right font-medium">Points</th>
                    <th className="pb-2 text-right font-medium">Remis</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedShops.map((shop) => (
                    <tr key={shop.id} className="border-t border-border/60">
                      <td className="py-2.5">
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shop.area}
                          {shop.operatorName ? ` · ${shop.operatorName}` : ""}
                          {shop.status === "ACTIVE" ? "" : " · désactivé"}
                        </p>
                      </td>
                      <td className="py-2.5 font-mono tracking-wider">
                        {displayShopCode(shop.code)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {shop.pendingDeposits + shop.pendingRedeems}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {shop.deposits30}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {shop.points30}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatUsd(shop.usd30)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dernières opérations</CardTitle>
          <CardDescription>
            Confirmations et refus récents dans vos shops
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
                  <th className="hidden pb-2 font-medium sm:table-cell">Shop</th>
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
                      <p className="text-xs text-muted-foreground">
                        {item.kind === "deposit" ? "Dépôt" : item.title}
                      </p>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      {item.shopName ?? "—"}
                    </td>
                    <td className="hidden py-2.5 text-muted-foreground md:table-cell">
                      {formatDateTimeKinshasa(new Date(item.at))}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{item.points}</td>
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
