'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from '@/components/ui/field'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Save, User } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { userRoleLabels } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          department: data.department || '',
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone || null,
        department: formData.department || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile?.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
    }

    setSaving(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardContent className="flex flex-col items-center pt-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile?.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-lg font-medium">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <Badge className="mt-2 capitalize">{profile?.role ? userRoleLabels[profile.role] : 'User'}</Badge>
            {profile?.student_id && (
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                ID: {profile.student_id}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <FieldDescription>Email cannot be changed</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Your full name"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </Field>

                {error && <FieldError>{error}</FieldError>}

                {success && (
                  <p className="text-sm text-accent">Profile updated successfully!</p>
                )}

                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
