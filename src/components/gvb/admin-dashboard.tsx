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
import type { AdminDashboard } from "@/modules/users"

export function AdminDashboardView({
  displayName,
  data,
}: {
  displayName: string
  data: AdminDashboard
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
          Vue réseau DEEE Kinshasa. Volumes sur 30 jours, sauf mention
          contraire.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Partenaires"
          value={String(data.partnersActive)}
          hint={`${data.partners} au total`}
          href="/admin/partenaires"
        />
        <DashboardStat
          label="Shops actifs"
          value={String(data.shopsActive)}
          hint={`${data.shops} au total`}
          href="/admin/shops"
        />
        <DashboardStat
          label="Citoyens"
          value={String(data.citizens)}
          hint={`${data.shopStaff} shops · ${data.partnerAdmins} admins`}
        />
        <DashboardStat
          label="Matériels actifs"
          value={String(data.materials)}
          href="/admin/materiels"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Dépôts en attente"
          value={String(data.pendingDeposits)}
        />
        <DashboardStat
          label="Échanges en attente"
          value={String(data.pendingRedeems)}
        />
        <DashboardStat
          label="Dépôts confirmés"
          value={String(data.confirmedDeposits30)}
          hint={`${data.pointsCredited30} pts crédités`}
        />
        <DashboardStat
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
        <DashboardDataTable
          title="Shops les plus actifs"
          description="Dépôts confirmés sur 30 jours"
          columns={[
            { label: "Shop" },
            { label: "Dépôts", align: "right" },
            { label: "Échanges", align: "right" },
            { label: "Points", align: "right" },
          ]}
          rows={data.topShops.map((item) => [
            item.name,
            String(item.deposits),
            String(item.redeems),
            String(item.points),
          ])}
          empty="Aucun dépôt confirmé sur la période."
        />
        <DashboardDataTable
          title="Partenaires"
          description="Volumes confirmés sur 30 jours"
          columns={[
            { label: "Entreprise" },
            { label: "Dépôts", align: "right" },
            { label: "Échanges", align: "right" },
            { label: "USD", align: "right" },
          ]}
          rows={data.topPartners.map((item) => [
            item.name,
            String(item.deposits),
            String(item.redeems),
            formatUsd(item.usd),
          ])}
          empty="Aucune activité confirmée sur la période."
        />
      </div>

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
            Confirmations et refus récents sur le réseau
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
                  <th className="hidden pb-2 font-medium md:table-cell">
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
                        {item.partnerName ? ` · ${item.partnerName}` : ""}
                      </p>
                    </td>
                    <td className="hidden py-2.5 md:table-cell">
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
