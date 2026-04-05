'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import type { CaseType, CasePriority } from '@/lib/types'
import { caseTypeLabels, casePriorityLabels } from '@/lib/types'

export default function NewCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'academic' as CaseType,
    priority: 'medium' as CasePriority,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title.trim()) {
      setError('Please provide a title for your case')
      setLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of your case')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a case')
      setLoading(false)
      return
    }

    // Generate case number
    const caseNumber = `CASE-${Date.now().toString(36).toUpperCase()}`

    const { data, error: insertError } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
        status: 'open',
        student_id: user.id,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating case:', insertError)
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/cases/${data.id}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Case</h1>
          <p className="text-muted-foreground">
            Submit a new case for review
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>
            Provide detailed information about your case to help us assist you better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="type">Case Type</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(caseTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select the category that best describes your case
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Brief summary of your case"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
                <FieldDescription>
                  A clear, concise title for your case (max 100 characters)
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your case..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  required
                />
                <FieldDescription>
                  Include all relevant details, dates, and any supporting information
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="priority">Priority</FieldLabel>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(casePriorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select the urgency level of your case
                </FieldDescription>
              </Field>

              {error && (
                <FieldError>{error}</FieldError>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  {loading ? 'Submitting...' : 'Submit Case'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/cases">Cancel</Link>
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
