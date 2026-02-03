'use client'

import { useRouter } from 'next/navigation'
import { LoopWithGenre } from '@/lib/database.types'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Download, Loader2, Check } from 'lucide-react'

interface PurchaseButtonProps {
  loop: LoopWithGenre
}

export function PurchaseButton({ loop }: PurchaseButtonProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const { data: purchaseStatus, isLoading: checkingPurchase } =
    trpc.purchases.checkPurchased.useQuery(
      { loopId: loop.id },
      { enabled: !!user }
    )

  const createCheckout = trpc.purchases.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  const getDownloadUrl = trpc.purchases.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a')
      link.href = data.url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  })

  const handleClick = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (purchaseStatus?.purchased) {
      getDownloadUrl.mutate({ loopId: loop.id })
    } else {
      createCheckout.mutate({ loopId: loop.id })
    }
  }

  const isLoading =
    authLoading ||
    checkingPurchase ||
    createCheckout.isPending ||
    getDownloadUrl.isPending

  const isPurchased = purchaseStatus?.purchased

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      variant={isPurchased ? 'secondary' : 'default'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPurchased ? (
        <>
          <Download className="h-4 w-4 mr-1" />
          Download
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-1" />
          Buy
        </>
      )}
    </Button>
  )
}
