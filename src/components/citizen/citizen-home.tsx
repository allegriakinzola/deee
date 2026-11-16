import Link from "next/link"

import { CitizenPageHeader, CitizenSection } from "@/components/citizen/citizen-page"
import {
  ChevronRightIcon,
  MapPinIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "lucide-react"

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
import { formatUsd } from "@/lib/money"
import { formatDateTimeKinshasa } from "@/lib/period"
import type { PublicShop } from "@/lib/public-directory"
import { cn } from "@/lib/utils"
import type { CitizenDashboard } from "@/modules/deposits"

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

export function CitizenHome({
  displayName,
  data,
  nearest,
}: {
  displayName: string
  data: CitizenDashboard
  nearest: PublicShop | null
}) {
  const firstName = displayName.trim().split(/\s+/)[0] || displayName
  const waiting = data.pendingDeposits + data.pendingRedeems
  const pointsToBon = Math.max(0, data.pointsPerBon - data.availablePoints)
  const balanceHint =
    data.points === 0
      ? "Déposez un appareil en shop pour créditer votre compte."
      : data.bonsAvailable < 1
        ? `Encore ${phrase(pointsToBon, "point", "points")} pour 1 bon.`
        : `${phrase(data.bonsAvailable, "bon", "bons")} à échanger en shop.`

  const actions = [
    {
      href: "/compte/depot",
      icon: RecycleIcon,
      label: "Déposer",
      hint: "Choisir les appareils et envoyer au shop",
    },
    {
      href: "/compte/echange",
      icon: SparklesIcon,
      label: "Échanger",
      hint: "Utiliser vos bons contre une offre",
    },
    {
      href: "/compte/catalogue",
      icon: SmartphoneIcon,
      label: "Catalogue",
      hint: "Voir les points de chaque appareil",
    },
    {
      href: "/compte/shops",
      icon: MapPinIcon,
      label: "Shops",
      hint: "Trouver un point de dépôt à Kinshasa",
    },
  ] as const

  return (
    <div className="flex flex-col gap-8 pb-2 lg:gap-10">
      <CitizenPageHeader
        title={`Mbote, ${firstName}`}
        description="Le solde est celui d’aujourd’hui. Les indicateurs portent sur 30 jours. Le graphique d’activité remonte jusqu’à un an."
      />

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
        <div className="order-2 flex flex-col gap-8 lg:order-1 lg:gap-10">

      <CitizenSection
        eyebrow="Aujourd’hui"
        title="Votre situation"
        description="Le solde est actuel. Les trois autres chiffres portent sur 30 jours."
      >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricLink
          href="/compte/depot"
          label="Solde"
          value={`${data.points} pts`}
          hint={balanceHint}
          tone="lead"
        />
        <MetricLink
          href="/compte/depot"
          label="Points gagnés"
          value={String(data.pointsCredited30)}
          hint={phrase(
            data.confirmedDeposits30,
            "dépôt confirmé",
            "dépôts confirmés"
          )}
        />
        <MetricLink
          href="/compte/echange"
          label="Valeur reçue"
          value={formatUsd(data.usd30)}
          hint={
            data.bons30 === 1
              ? "1 bon confirmé"
              : `${data.bons30} bons confirmés`
          }
        />
        <MetricLink
          href={data.pendingDeposits > 0 ? "/compte/depot" : "/compte/echange"}
          label="En attente du shop"
          value={String(waiting)}
          hint={`${phrase(data.pendingDeposits, "dépôt", "dépôts")} · ${phrase(data.pendingRedeems, "échange", "échanges")}`}
          tone={waiting > 0 ? "alert" : "plain"}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-4">
        <Link
          href="/compte/echange"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Échanges confirmés</p>
          <p className="mt-1 text-lg font-semibold">{data.confirmedRedeems30}</p>
        </Link>
        <Link
          href="/compte/echange"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Points utilisés</p>
          <p className="mt-1 text-lg font-semibold">{data.pointsDebited30}</p>
        </Link>
        <Link
          href="/compte/depot"
          className="rounded-2xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
        >
          <p className="text-xs text-muted-foreground">Refus</p>
          <p className="mt-1 text-lg font-semibold">
            {data.rejectedDeposits30 + data.rejectedRedeems30}
          </p>
        </Link>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3.5 ring-1 ring-zinc-200/80">
          <p className="text-xs text-muted-foreground">Points pour 1 bon</p>
          <p className="mt-1 text-lg font-semibold">{data.pointsPerBon}</p>
        </div>
      </div>
      </CitizenSection>

      <CitizenSection
        eyebrow="Activité"
        title="Dépôts, échanges et points"
        description="Chaque jour, chaque semaine ou chaque mois, jusqu’à un an."
      >
        <ActivityChart points={data.daily} />
      </CitizenSection>

      <CitizenSection
        eyebrow="30 jours"
        title="Le détail"
        description="Matériels, offres reçues, shops et le suivi des statuts."
      >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ce que j’ai déposé</CardTitle>
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
            <CardTitle>Ce que j’ai reçu</CardTitle>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shops où j’ai déposé</CardTitle>
            <CardDescription>Dépôts confirmés sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <RankChart
              items={data.shops.map((shop) => ({
                label: shop.name,
                value: shop.confirmed,
                detail: `${shop.confirmed} · ${shop.points} pts`,
              }))}
              empty="Aucun shop sur la période."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prochain shop</CardTitle>
            <CardDescription>
              {data.lastDeposit
                ? `Dernier dépôt confirmé : ${data.lastDeposit.shopName}, +${data.lastDeposit.points} pts`
                : "Aucun dépôt confirmé pour l’instant"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nearest ? (
              <Link
                href={`https://www.google.com/maps?q=${nearest.lat},${nearest.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MapPinIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{nearest.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {nearest.area}
                  </span>
                </span>
                <span className="text-sm font-semibold text-emerald-800">
                  Y aller
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun shop actif pour le moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      </CitizenSection>
        </div>

        <aside className="order-1 lg:sticky lg:top-0 lg:order-2">
          <CitizenSection eyebrow="Actions" title="Que voulez-vous faire ?">
            <ul className="-mx-2 divide-y divide-zinc-100">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-zinc-50"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-zinc-950">
                          {action.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-zinc-500">
                          {action.hint}
                        </span>
                      </span>
                      <ChevronRightIcon className="size-4 shrink-0 text-zinc-400" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </CitizenSection>
        </aside>
      </div>

      <CitizenSection
        eyebrow="Historique"
        title="Dernières opérations"
        description="Confirmations et refus les plus récents."
      >
          {data.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pas encore d’historique.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Opération</th>
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
                      <p>{item.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {item.shopName ?? "—"}
                      </p>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      {item.shopName ?? "—"}
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
      </CitizenSection>
    </div>
  )
}
