import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type Stat = {
  label: string
  value: string
  hint: string
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {stat.value}
            </CardTitle>
            <CardDescription className="text-xs">{stat.hint}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
