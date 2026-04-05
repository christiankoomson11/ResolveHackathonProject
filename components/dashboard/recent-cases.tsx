import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Case, CaseStatus, CasePriority, CaseType } from '@/lib/types'
import { caseStatusLabels, casePriorityLabels, caseTypeLabels } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RecentCasesProps {
  cases: Case[]
}

const statusVariants: Record<CaseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  in_progress: 'secondary',
  pending_info: 'outline',
  resolved: 'secondary',
  closed: 'outline',
}

const priorityVariants: Record<CasePriority, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

export function RecentCases({ cases }: RecentCasesProps) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>Your most recent case activity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="mb-4 text-muted-foreground">No cases found</p>
          <Button asChild>
            <Link href="/cases/new">Create your first case</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>Your most recent case activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cases" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/cases/${caseItem.id}`}
              className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {caseItem.case_number}
                  </span>
                  <Badge variant={priorityVariants[caseItem.priority]} className="text-xs">
                    {casePriorityLabels[caseItem.priority]}
                  </Badge>
                </div>
                <h4 className="font-medium leading-tight">{caseItem.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {caseTypeLabels[caseItem.type]}
                  </Badge>
                  <span>
                    {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Badge variant={statusVariants[caseItem.status]}>
                {caseStatusLabels[caseItem.status]}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
