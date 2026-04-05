import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <GraduationCap className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">CALM</h1>
          <p className="text-sm text-muted-foreground">Case & Lifecycle Management</p>
        </div>
      </div>

      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could happen if your confirmation link has expired or has already been used.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/login">Try signing in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/sign-up">Create a new account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
