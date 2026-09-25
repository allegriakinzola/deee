import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DashboardDataTable({
  title,
  description,
  columns,
  rows,
  empty,
}: {
  title: string
  description: string
  columns: Array<{ label: string; align?: "left" | "right" }>
  rows: string[][]
  empty: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.label}
                    className={
                      column.align === "right"
                        ? "pb-2 text-right font-medium"
                        : "pb-2 font-medium"
                    }
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join("|")} className="border-t border-border/60">
                  {row.map((cell, index) => (
                    <td
                      key={`${columns[index]?.label ?? index}-${cell}`}
                      className={
                        columns[index]?.align === "right"
                          ? "py-2.5 text-right"
                          : "py-2.5"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
