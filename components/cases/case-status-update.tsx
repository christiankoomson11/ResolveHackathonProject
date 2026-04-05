'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type { CaseStatus } from '@/lib/types'
import { caseStatusLabels } from '@/lib/types'

interface CaseStatusUpdateProps {
  caseId: string
  currentStatus: CaseStatus
}

export function CaseStatusUpdate({ caseId, currentStatus }: CaseStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState<CaseStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return

    setLoading(true)

    const supabase = createClient()
    
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set resolved_at when status changes to resolved
    if (status === 'resolved' && currentStatus !== 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }

    // Set closed_at when status changes to closed
    if (status === 'closed' && currentStatus !== 'closed') {
      updateData.closed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', caseId)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={(value) => setStatus(value as CaseStatus)}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(caseStatusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="w-full"
        size="sm"
      >
        {loading ? <Spinner className="mr-2" /> : null}
        {loading ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  )
}
