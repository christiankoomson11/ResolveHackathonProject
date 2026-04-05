import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  totalCases: number
  openCases: number
  resolvedCases: number
  urgentCases: number
}

export function StatsCards({ totalCases, openCases, resolvedCases, urgentCases }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Cases',
      value: totalCases,
      icon: FolderOpen,
      description: 'All time cases',
      className: 'bg-primary/10 text-primary',
    },
    {
      title: 'Open Cases',
      value: openCases,
      icon: Clock,
      description: 'Currently active',
      className: 'bg-chart-2/10 text-chart-2',
    },
    {
      title: 'Resolved',
      value: resolvedCases,
      icon: CheckCircle2,
      description: 'Successfully closed',
      className: 'bg-accent/10 text-accent',
    },
    {
      title: 'Urgent',
      value: urgentCases,
      icon: AlertTriangle,
      description: 'Requires attention',
      className: 'bg-destructive/10 text-destructive',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.className}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
