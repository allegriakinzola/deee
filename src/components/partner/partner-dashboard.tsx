import Link from "next/link"

import { PeriodChart } from "@/components/dashboard/period-chart"
import { DashboardDataTable } from "@/components/dashboard/data-table"
import { DashboardStat } from "@/components/dashboard/stat"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import type { PartnerDashboard } from "@/modules/partners"

export function PartnerDashboardView({
  displayName,
  partnerName,
  data,
}: {
  displayName: string
  partnerName: string
  data: PartnerDashboard
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
          {partnerName}. Activité de vos shops sur 30 jours, sauf mention
          contraire. Les récompenses proposées au citoyen se règlent dans{" "}
          <Link href="/partenaire/offres" className="font-medium text-foreground underline">
            Offres
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Shops actifs"
          value={`${data.shopsActive}`}
          hint={`${data.shops} au total`}
          href="/partenaire/shops"
        />
        <DashboardStat
          label="Équipe"
          value={String(data.members)}
          href="/partenaire/utilisateurs"
        />
        <DashboardStat
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${data.pointsCredited30} pts · ${data.pendingDeposits} en attente · ${data.rejectedDeposits30} refusés`}
          href="/partenaire/depots"
        />
        <DashboardStat
          label="Échanges confirmés"
          value={String(data.confirmedRedeems30)}
          hint={`${data.bons30} bon${data.bons30 === 1 ? "" : "s"} · ${formatUsd(data.usd30)} · ${data.pendingRedeems} en attente`}
          href="/partenaire/echanges"
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Vos shops</h2>
            <p className="text-sm text-muted-foreground">
              Identité, compte et activité des 30 derniers jours
            </p>
          </div>
          <Link
            href="/partenaire/shops"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Gérer les shops
          </Link>
        </div>
        {data.shopRows.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              Aucun shop pour le moment.{" "}
              <Link
                href="/partenaire/shops"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Créer le premier
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.shopRows.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardContent className="pt-5">
          <PeriodChart points={data.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardDataTable
          title="Matériels les plus déposés"
          description="Quantités confirmées sur 30 jours"
          columns={[
            { label: "Article" },
            { label: "Qté", align: "right" },
            { label: "Points", align: "right" },
          ]}
          rows={data.topMaterials.map((item) => [
            item.name,
            String(item.quantity),
            String(item.points),
          ])}
          empty="Aucun dépôt confirmé sur la période."
        />
        <DashboardDataTable
          title="Objets d’échange"
          description="Récompenses remises sur 30 jours"
          columns={[
            { label: "Objet" },
            { label: "Nb", align: "right" },
            { label: "USD", align: "right" },
          ]}
          rows={data.rewards.map((item) => [
            item.label,
            String(item.count),
            formatUsd(item.usd),
          ])}
          empty="Aucun échange confirmé sur la période."
        />
      </div>

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
                  <th className="hidden pb-2 font-medium sm:table-cell">
                    Shop
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
                      <p className="text-xs text-muted-foreground">
                        {item.title}
                      </p>
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      {item.shopName ?? "—"}
                    </td>
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

function ShopCard({
  shop,
}: {
  shop: PartnerDashboard["shopRows"][number]
}) {
  const pending = shop.pendingDeposits + shop.pendingRedeems
  const operator =
    shop.operatorEmail ?? shop.operatorName ?? "Aucun compte"

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{shop.name}</CardTitle>
            <CardDescription>{shop.area}</CardDescription>
          </div>
          <Badge variant={shop.status === "ACTIVE" ? "default" : "secondary"}>
            {shop.status === "ACTIVE" ? "Actif" : "Désactivé"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Code </span>
            <span className="font-mono tracking-wider">
              {displayShopCode(shop.code)}
            </span>
          </p>
          <p>
            <span className="text-muted-foreground">Responsable </span>
            {operator}
          </p>
        </div>
        {shop.operatorAccess && shop.operatorAccess !== "READY" ? (
          <Badge variant="secondary">Invitation en attente</Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Metric label="En attente" value={String(pending)} />
          <Metric
            label="Dépôts"
            value={String(shop.deposits30)}
            hint={`${shop.points30} pts`}
          />
          <Metric
            label="Échanges"
            value={String(shop.redeems30)}
            hint={`${shop.bons30} bon${shop.bons30 === 1 ? "" : "s"}`}
          />
          <Metric label="Remis" value={formatUsd(shop.usd30)} />
        </dl>
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold tracking-tight">{value}</dd>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
