import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, FolderKanban } from 'lucide-react'
import type { Notification } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
  }

  const allNotifications = (notifications || []) as Notification[]
  const unreadCount = allNotifications.filter((n) => !n.is_read).length

  // Mark all as read
  if (unreadCount > 0) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your case activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge>{unreadCount} new</Badge>
        )}
      </div>

      {allNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No notifications</h3>
            <p className="text-center text-muted-foreground">
              {"You're all caught up! New notifications will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.case_id ? `/cases/${notification.case_id}` : '#'}
                className={`flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'bg-muted/30' : ''
                }`}
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
