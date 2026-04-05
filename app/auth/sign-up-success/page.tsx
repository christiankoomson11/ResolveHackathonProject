import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Mail, CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link to verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <Mail className="h-5 w-5" />
            <span>Please check your inbox and spam folder</span>
          </div>

          <p className="text-sm text-muted-foreground">
            After confirming your email, you can sign in to access the case management system.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
