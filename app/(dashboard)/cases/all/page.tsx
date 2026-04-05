import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CasesTable } from '@/components/cases/cases-table'
import { CasesFilters } from '@/components/cases/cases-filters'
import type { Case, Profile, CaseFilters } from '@/lib/types'

interface AllCasesPageProps {
  searchParams: Promise<{
    search?: string
    type?: string
    status?: string
    priority?: string
    page?: string
  }>
}

export default async function AllCasesPage({ searchParams }: AllCasesPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is staff or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'student') {
    redirect('/cases')
  }

  // Build query with filters
  let query = supabase
    .from('cases')
    .select('*, student:profiles!cases_student_id_fkey(*), assignee:profiles!cases_assigned_to_fkey(*)', { count: 'exact' })

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,case_number.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type)
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  if (params.priority && params.priority !== 'all') {
    query = query.eq('priority', params.priority)
  }

  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data: cases, error, count } = await query

  if (error) {
    console.error('Error fetching cases:', error)
  }

  const allCases = (cases || []) as (Case & { student: Profile; assignee: Profile | null })[]
  const totalPages = Math.ceil((count || 0) / limit)

  // Get staff members for filter
  const { data: staffMembers } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['staff', 'admin'])

  const filters: CaseFilters = {
    search: params.search || '',
    type: (params.type as CaseFilters['type']) || 'all',
    status: (params.status as CaseFilters['status']) || 'all',
    priority: (params.priority as CaseFilters['priority']) || 'all',
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Cases</h1>
        <p className="text-muted-foreground">
          View and manage all submitted cases
        </p>
      </div>

      <CasesFilters filters={filters} />

      <CasesTable
        cases={allCases}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
