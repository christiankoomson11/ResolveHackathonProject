// Database Types for Student Case Management System

export type UserRole = 'student' | 'staff' | 'admin'

export type CaseType = 'academic' | 'financial' | 'conduct' | 'support' | 'administrative'

export type CaseStatus = 'open' | 'in_progress' | 'pending_info' | 'resolved' | 'closed'

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  department: string | null
  student_id: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  case_number: string
  title: string
  description: string
  type: CaseType
  status: CaseStatus
  priority: CasePriority
  student_id: string
  assigned_to: string | null
  created_by: string
  resolved_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  student?: Profile
  assignee?: Profile
  creator?: Profile
}

export interface CaseComment {
  id: string
  case_id: string
  author_id: string
  content: string
  is_internal: boolean
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
}

export interface CaseDocument {
  id: string
  case_id: string
  uploaded_by: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  created_at: string
  // Joined fields
  uploader?: Profile
}

export interface CaseHistory {
  id: string
  case_id: string
  changed_by: string
  field_changed: string
  old_value: string | null
  new_value: string | null
  created_at: string
  // Joined fields
  changer?: Profile
}

export interface Notification {
  id: string
  user_id: string
  case_id: string | null
  title: string
  message: string
  is_read: boolean
  created_at: string
  // Joined fields
  case?: Case
}

// Dashboard Stats
export interface DashboardStats {
  totalCases: number
  openCases: number
  resolvedCases: number
  urgentCases: number
  casesByType: { type: CaseType; count: number }[]
  casesByStatus: { status: CaseStatus; count: number }[]
  recentCases: Case[]
}

// Form Types
export interface CreateCaseInput {
  title: string
  description: string
  type: CaseType
  priority: CasePriority
  student_id?: string // Only for staff/admin creating on behalf of student
}

export interface UpdateCaseInput {
  title?: string
  description?: string
  type?: CaseType
  status?: CaseStatus
  priority?: CasePriority
  assigned_to?: string | null
}

export interface CreateCommentInput {
  case_id: string
  content: string
  is_internal?: boolean
}

// Filter Types
export interface CaseFilters {
  search?: string
  type?: CaseType | 'all'
  status?: CaseStatus | 'all'
  priority?: CasePriority | 'all'
  assigned_to?: string | 'all'
  date_from?: string
  date_to?: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Helper functions
export const caseTypeLabels: Record<CaseType, string> = {
  academic: 'Academic',
  financial: 'Financial',
  conduct: 'Conduct',
  support: 'Support',
  administrative: 'Administrative',
}

export const caseStatusLabels: Record<CaseStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_info: 'Pending Info',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const casePriorityLabels: Record<CasePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const userRoleLabels: Record<UserRole, string> = {
  student: 'Student',
  staff: 'Staff',
  admin: 'Administrator',
}
