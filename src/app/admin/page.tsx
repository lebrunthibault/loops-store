'use client'

import { trpc } from '@/lib/trpc'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, ShoppingCart, Tags, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery()
  const { data: recentPurchases } = trpc.admin.getRecentPurchases.useQuery({
    limit: 5,
  })

  const statCards = [
    {
      title: 'Total Loops',
      value: stats?.totalLoops ?? 0,
      icon: Music,
    },
    {
      title: 'Total Purchases',
      value: stats?.totalPurchases ?? 0,
      icon: ShoppingCart,
    },
    {
      title: 'Total Genres',
      value: stats?.totalGenres ?? 0,
      icon: Tags,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your audio marketplace
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases?.length === 0 ? (
            <p className="text-muted-foreground">No purchases yet</p>
          ) : (
            <div className="space-y-4">
              {recentPurchases?.map((purchase) => {
                const loop = purchase.loops as { title: string; price: number }
                return (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{loop?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(loop?.price ?? 0)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
