import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusCircle } from 'lucide-react'
import type { Case, CaseStatus, CasePriority } from '@/lib/types'
import { caseStatusLabels, casePriorityLabels, caseTypeLabels } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

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

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'student'

  // Fetch cases based on role
  let casesQuery = supabase.from('cases').select('*')

  if (role === 'student') {
    casesQuery = casesQuery.eq('student_id', user.id)
  }

  const { data: cases, error } = await casesQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cases:', error)
  }

  const allCases = (cases || []) as Case[]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Cases</h1>
          <p className="text-muted-foreground">
            View and manage your submitted cases
          </p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {allCases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No cases yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {"You haven't submitted any cases yet. Create your first case to get started."}
            </p>
            <Button asChild>
              <Link href="/cases/new">Create your first case</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allCases.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/cases/${caseItem.id}`}
              className="block"
            >
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {caseItem.case_number}
                        </span>
                        <Badge variant={priorityVariants[caseItem.priority]} className="text-xs">
                          {casePriorityLabels[caseItem.priority]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {caseItem.description}
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariants[caseItem.status]}>
                      {caseStatusLabels[caseItem.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{caseTypeLabels[caseItem.type]}</Badge>
                    <span>
                      Created {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
