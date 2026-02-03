'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Music, Loader2 } from 'lucide-react'

export default function PurchasesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: purchases, isLoading } = trpc.purchases.list.useQuery(
    undefined,
    { enabled: !!user }
  )

  const getDownloadUrl = trpc.purchases.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a')
      link.href = data.url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
        <p className="text-muted-foreground">
          Download your purchased loops anytime
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : purchases?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start browsing our collection of piano loops
            </p>
            <Button onClick={() => router.push('/')}>Browse Loops</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases?.map((purchase) => {
            const loop = purchase.loops as {
              id: string
              title: string
              bpm: number
              key: string
              duration: number
              price: number
              genres: { name: string } | null
            }

            return (
              <Card key={purchase.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{loop.title}</CardTitle>
                  {loop.genres && (
                    <Badge variant="secondary">{loop.genres.name}</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{loop.bpm} BPM</span>
                    <span>·</span>
                    <span>{loop.key}</span>
                    <span>·</span>
                    <span>{formatDuration(loop.duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Purchased on{' '}
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => getDownloadUrl.mutate({ loopId: loop.id })}
                      disabled={getDownloadUrl.isPending}
                    >
                      {getDownloadUrl.isPending &&
                      getDownloadUrl.variables?.loopId === loop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
