'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import type { Case, Profile, CaseStatus, CasePriority } from '@/lib/types'
import { caseStatusLabels, casePriorityLabels, caseTypeLabels } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface CasesTableProps {
  cases: (Case & { student: Profile; assignee: Profile | null })[]
  currentPage: number
  totalPages: number
  totalCount: number
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

export function CasesTable({ cases, currentPage, totalPages, totalCount }: CasesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/cases/all?${params.toString()}`)
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">No cases found matching your criteria</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {caseItem.case_number}
                    </p>
                    <p className="font-medium line-clamp-1">{caseItem.title}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{caseTypeLabels[caseItem.type]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {caseItem.student?.full_name
                          ? getInitials(caseItem.student.full_name)
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{caseItem.student?.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariants[caseItem.priority]}>
                    {casePriorityLabels[caseItem.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[caseItem.status]}>
                    {caseStatusLabels[caseItem.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {caseItem.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(caseItem.assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{caseItem.assignee.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/cases/${caseItem.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t py-4">
        <p className="text-sm text-muted-foreground">
          Showing {cases.length} of {totalCount} cases
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
