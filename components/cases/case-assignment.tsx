'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'

interface CaseAssignmentProps {
  caseId: string
  currentAssignee: Profile | null
  staffMembers: Profile[]
}

export function CaseAssignment({ caseId, currentAssignee, staffMembers }: CaseAssignmentProps) {
  const router = useRouter()
  const [assigneeId, setAssigneeId] = useState<string>(currentAssignee?.id || 'unassigned')
  const [loading, setLoading] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAssign = async () => {
    const newAssigneeId = assigneeId === 'unassigned' ? null : assigneeId
    const currentId = currentAssignee?.id || null

    if (newAssigneeId === currentId) return

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('cases')
      .update({
        assigned_to: newAssigneeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)

    if (error) {
      console.error('Error assigning case:', error)
    } else {
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {currentAssignee && (
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(currentAssignee.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{currentAssignee.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentAssignee.role}</p>
          </div>
        </div>
      )}

      <Select value={assigneeId} onValueChange={setAssigneeId}>
        <SelectTrigger>
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {staffMembers.map((staff) => (
            <SelectItem key={staff.id} value={staff.id}>
              {staff.full_name} ({staff.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleAssign}
        disabled={
          loading ||
          (assigneeId === 'unassigned' ? !currentAssignee : assigneeId === currentAssignee?.id)
        }
        className="w-full"
        size="sm"
      >
        {loading ? <Spinner className="mr-2" /> : null}
        {loading ? 'Assigning...' : 'Update Assignment'}
      </Button>
    </div>
  )
}
