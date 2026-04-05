'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { Send, Lock } from 'lucide-react'
import type { CaseComment, Profile } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface CaseCommentsProps {
  caseId: string
  comments: (CaseComment & { author: Profile })[]
  currentUser: Profile | null
  isStaffOrAdmin: boolean
}

export function CaseComments({
  caseId,
  comments,
  currentUser,
  isStaffOrAdmin,
}: CaseCommentsProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('case_comments').insert({
      case_id: caseId,
      author_id: currentUser?.id,
      content: content.trim(),
      is_internal: isStaffOrAdmin ? isInternal : false,
    })

    if (error) {
      console.error('Error adding comment:', error)
    } else {
      setContent('')
      setIsInternal(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Start the conversation below.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 rounded-lg p-3 ${
                comment.is_internal ? 'bg-muted/50 border border-dashed' : ''
              }`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {comment.author?.full_name ? getInitials(comment.author.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.author?.full_name || 'Unknown'}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {comment.author?.role || 'user'}
                  </Badge>
                  {comment.is_internal && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Internal
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between">
          {isStaffOrAdmin && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked === true)}
              />
              <span className="text-muted-foreground">Internal note (not visible to student)</span>
            </label>
          )}
          <Button type="submit" disabled={loading || !content.trim()} className="ml-auto">
            {loading ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}
