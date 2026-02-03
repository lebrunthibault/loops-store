'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Download, Music } from 'lucide-react'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionId, router])

  if (!sessionId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. Your loop is now available for download.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/purchases">
                <Download className="h-4 w-4 mr-2" />
                Go to My Purchases
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Music className="h-4 w-4 mr-2" />
                Browse More Loops
              </Link>
            </Button>
          </div>

          {countdown > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Redirecting to purchases in {countdown}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
