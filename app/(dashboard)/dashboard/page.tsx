import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CasesByTypeChart } from '@/components/dashboard/cases-by-type-chart'
import { CasesByStatusChart } from '@/components/dashboard/cases-by-status-chart'
import { RecentCases } from '@/components/dashboard/recent-cases'
import type { Case, CaseType, CaseStatus } from '@/lib/types'

async function getDashboardData(userId: string, role: string) {
  const supabase = await createClient()

  // Build query based on role
  let casesQuery = supabase.from('cases').select('*')

  if (role === 'student') {
    casesQuery = casesQuery.eq('student_id', userId)
  }

  const { data: cases, error } = await casesQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cases:', error)
    return {
      totalCases: 0,
      openCases: 0,
      resolvedCases: 0,
      urgentCases: 0,
      casesByType: [],
      casesByStatus: [],
      recentCases: [],
    }
  }

  const allCases = (cases || []) as Case[]

  // Calculate stats
  const totalCases = allCases.length
  const openCases = allCases.filter(
    (c) => c.status === 'open' || c.status === 'in_progress' || c.status === 'pending_info'
  ).length
  const resolvedCases = allCases.filter((c) => c.status === 'resolved' || c.status === 'closed').length
  const urgentCases = allCases.filter((c) => c.priority === 'urgent' && c.status !== 'closed').length

  // Cases by type
  const typeCount: Record<CaseType, number> = {
    academic: 0,
    financial: 0,
    conduct: 0,
    support: 0,
    administrative: 0,
  }
  allCases.forEach((c) => {
    if (typeCount[c.type] !== undefined) {
      typeCount[c.type]++
    }
  })
  const casesByType = Object.entries(typeCount).map(([type, count]) => ({
    type: type as CaseType,
    count,
  }))

  // Cases by status
  const statusCount: Record<CaseStatus, number> = {
    open: 0,
    in_progress: 0,
    pending_info: 0,
    resolved: 0,
    closed: 0,
  }
  allCases.forEach((c) => {
    if (statusCount[c.status] !== undefined) {
      statusCount[c.status]++
    }
  })
  const casesByStatus = Object.entries(statusCount).map(([status, count]) => ({
    status: status as CaseStatus,
    count,
  }))

  // Recent cases (last 5)
  const recentCases = allCases.slice(0, 5)

  return {
    totalCases,
    openCases,
    resolvedCases,
    urgentCases,
    casesByType,
    casesByStatus,
    recentCases,
  }
}

export default async function DashboardPage() {
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
  const stats = await getDashboardData(user.id, role)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground">
          {"Here's an overview of your case management activity"}
        </p>
      </div>

      <StatsCards
        totalCases={stats.totalCases}
        openCases={stats.openCases}
        resolvedCases={stats.resolvedCases}
        urgentCases={stats.urgentCases}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CasesByTypeChart data={stats.casesByType} />
        <CasesByStatusChart data={stats.casesByStatus} />
      </div>

      <RecentCases cases={stats.recentCases} />
    </div>
  )
}
