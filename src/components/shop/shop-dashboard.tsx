import Link from "next/link"

import { PeriodChart } from "@/components/dashboard/period-chart"
import { ShopCodePanel } from "@/components/shop/shop-code-panel"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatUsd } from "@/lib/money"
import type { ShopDashboard } from "@/modules/shops"

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
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Tableau de bord
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Bonjour, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {shopName}
          {partnerName ? ` · ${partnerName}` : ""}. 30 derniers jours, sauf
          mention contraire.
        </p>
      </div>

      {shopCode ? <ShopCodePanel code={shopCode} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Dépôts en attente"
          value={String(data.pendingDeposits)}
          href="/shop/depots"
        />
        <Stat
          label="Échanges en attente"
          value={String(data.pendingRedeems)}
          href="/shop/echanges"
        />
        <Stat
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${data.pointsCredited30} pts crédités`}
        />
        <Stat
          label="Échanges confirmés"
          value={String(data.confirmedRedeems30)}
          hint={`${data.bons30} bon${data.bons30 === 1 ? "" : "s"} · ${formatUsd(data.usd30)}`}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          <PeriodChart points={data.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matériels les plus déposés</CardTitle>
            <CardDescription>Quantités confirmées sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun dépôt confirmé sur la période.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Article</th>
                    <th className="pb-2 text-right font-medium">Qté</th>
                    <th className="pb-2 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topMaterials.map((item) => (
                    <tr key={item.name} className="border-t border-border/60">
                      <td className="py-2.5">{item.name}</td>
                      <td className="py-2.5 text-right">{item.quantity}</td>
                      <td className="py-2.5 text-right">{item.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objets d’échange</CardTitle>
            <CardDescription>Récompenses remises sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            {data.rewards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun échange confirmé sur la période.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Objet</th>
                    <th className="pb-2 text-right font-medium">Nb</th>
                    <th className="pb-2 text-right font-medium">USD</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rewards.map((item) => (
                    <tr key={item.label} className="border-t border-border/60">
                      <td className="py-2.5">{item.label}</td>
                      <td className="py-2.5 text-right">{item.count}</td>
                      <td className="py-2.5 text-right">
                        {formatUsd(item.usd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                        {item.title}
                      </p>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">{item.title}</td>
                    <td className="py-2.5 text-right">{item.points}</td>
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

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string
  hint?: string
  href?: string
}) {
  const body = (
    <>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10"
      >
        {body}
      </Link>
    )
  }

  return (
    <div className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10">
      {body}
    </div>
  )
}
