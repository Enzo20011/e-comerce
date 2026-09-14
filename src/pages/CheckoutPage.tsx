import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ShippingForm } from '../components/checkout/ShippingForm'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import { OrderConfirmation } from '../components/checkout/OrderConfirmation'
import { addOrder } from '../data/orderStore'
import { generateOrderNumber } from '../utils/order'
import type { Order, ShippingDetails } from '../types/order'

export function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart()
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  useDocumentTitle('Checkout')

  if (!confirmedOrder && state.items.length === 0) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(shipping: ShippingDetails) {
    const order: Order = {
      orderNumber: generateOrderNumber(),
      items: state.items,
      subtotal,
      shipping,
      createdAt: new Date().toISOString(),
    }
    addOrder(order)
    clearCart()
    setConfirmedOrder(order)
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
        <ShippingForm onSubmit={handleSubmit} />
        <CheckoutSummary items={state.items} subtotal={subtotal} />
      </div>
    </div>
  )
}
