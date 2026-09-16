import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCart } from '../hooks/useCart'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ShippingForm } from '../components/checkout/ShippingForm'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import { OrderConfirmation } from '../components/checkout/OrderConfirmation'
import { addOrder } from '../data/orderStore'
import { ApiError } from '../lib/api'
import type { CouponValidationResult, Order, ShippingDetails } from '../types/order'

export function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart()
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; result: CouponValidationResult } | null>(
    null,
  )

  useDocumentTitle('Checkout')

  if (!confirmedOrder && state.items.length === 0) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(shipping: ShippingDetails) {
    setSubmitting(true)
    try {
      const order = await addOrder({
        items: state.items.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
          },
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        couponCode: appliedCoupon?.result.valid ? appliedCoupon.code : undefined,
      })
      clearCart()
      setConfirmedOrder(order)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'No pudimos confirmar tu pedido. Intentá de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <OrderConfirmation order={confirmedOrder} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Checkout</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <ShippingForm onSubmit={handleSubmit} submitting={submitting} />
        <CheckoutSummary
          items={state.items}
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          onCouponApplied={(code, result) => setAppliedCoupon({ code, result })}
          onCouponRemoved={() => setAppliedCoupon(null)}
        />
      </div>
    </div>
  )
}
