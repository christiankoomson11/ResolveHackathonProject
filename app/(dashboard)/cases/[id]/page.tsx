import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, User, Calendar, FileText, MessageSquare } from 'lucide-react'
import type { Case, CaseComment, CaseStatus, CasePriority, Profile } from '@/lib/types'
import { caseStatusLabels, casePriorityLabels, caseTypeLabels } from '@/lib/types'
import { format } from 'date-fns'
import { CaseComments } from '@/components/cases/case-comments'
import { CaseStatusUpdate } from '@/components/cases/case-status-update'
import { CaseAssignment } from '@/components/cases/case-assignment'
import { CaseDocuments } from '@/components/cases/case-documents'
import type { CaseDocument } from '@/lib/types'

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

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isStaffOrAdmin = profile?.role === 'staff' || profile?.role === 'admin'

  // Fetch the case
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (caseError || !caseData) {
    notFound()
  }

  const caseItem = caseData as Case

  // Check access - students can only view their own cases
  if (profile?.role === 'student' && caseItem.student_id !== user.id) {
    redirect('/cases')
  }

  // Fetch comments
  const { data: commentsData } = await supabase
    .from('case_comments')
    .select('*, author:profiles(*)')
    .eq('case_id', id)
    .order('created_at', { ascending: true })

  const comments = (commentsData || []) as (CaseComment & { author: Profile })[]

  // Filter internal comments for students
  const visibleComments = profile?.role === 'student'
    ? comments.filter((c) => !c.is_internal)
    : comments

  // Fetch student info
  const { data: studentData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', caseItem.student_id)
    .single()

  // Fetch assignee info if assigned
  let assigneeData = null
  if (caseItem.assigned_to) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', caseItem.assigned_to)
      .single()
    assigneeData = data
  }

  // Fetch staff members for assignment (only for staff/admin)
  let staffMembers: Profile[] = []
  if (isStaffOrAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['staff', 'admin'])
    staffMembers = (data || []) as Profile[]
  }

  // Fetch documents
  const { data: documentsData } = await supabase
    .from('case_documents')
    .select('*, uploader:profiles(*)')
    .eq('case_id', id)
    .order('created_at', { ascending: false })

  const documents = (documentsData || []) as (CaseDocument & { uploader: Profile | null })[]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{caseItem.case_number}</span>
            <Badge variant={priorityVariants[caseItem.priority]}>
              {casePriorityLabels[caseItem.priority]}
            </Badge>
            <Badge variant={statusVariants[caseItem.status]}>
              {caseStatusLabels[caseItem.status]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{caseItem.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {caseItem.description}
              </p>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <CaseDocuments
            caseId={id}
            documents={documents}
            currentUser={profile}
            isStaffOrAdmin={isStaffOrAdmin}
          />

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
              <CardDescription>
                Communication history for this case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaseComments
                caseId={id}
                comments={visibleComments}
                currentUser={profile}
                isStaffOrAdmin={isStaffOrAdmin}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Info */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{caseTypeLabels[caseItem.type]}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted by</p>
                  <p className="text-sm font-medium">{studentData?.full_name || 'Unknown'}</p>
                  {studentData?.student_id && (
                    <p className="text-xs text-muted-foreground">{studentData.student_id}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(caseItem.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(caseItem.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>

              {caseItem.resolved_at && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm font-medium">
                        {format(new Date(caseItem.resolved_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assignment (Staff/Admin only) */}
          {isStaffOrAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseAssignment
                  caseId={id}
                  currentAssignee={assigneeData}
                  staffMembers={staffMembers}
                />
              </CardContent>
            </Card>
          )}

          {/* Status Update (Staff/Admin only) */}
          {isStaffOrAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseStatusUpdate
                  caseId={id}
                  currentStatus={caseItem.status}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
