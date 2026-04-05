'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import type { CaseStatus } from '@/lib/types'
import { caseStatusLabels } from '@/lib/types'

interface CasesByStatusChartProps {
  data: { status: CaseStatus; count: number }[]
}

const STATUS_COLORS: Record<CaseStatus, string> = {
  open: 'var(--color-chart-1)',
  in_progress: 'var(--color-chart-2)',
  pending_info: 'var(--color-chart-3)',
  resolved: 'var(--color-accent)',
  closed: 'var(--color-muted-foreground)',
}

export function CasesByStatusChart({ data }: CasesByStatusChartProps) {
  const chartData = data.map((item) => ({
    name: caseStatusLabels[item.status],
    value: item.count,
    status: item.status,
  }))

  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cases by Status</CardTitle>
          <CardDescription>Current status distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No case data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cases by Status</CardTitle>
        <CardDescription>Current status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
