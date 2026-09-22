import { ArrowLeft, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { EmptyState } from '../common/EmptyState'
import { CartItemRow } from './CartItemRow'
import { CartSummary } from './CartSummary'

export function CartDrawer() {
  const { state, subtotal, closeCart, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const { items, isOpen } = state

  function handleCheckout() {
    closeCart()
    navigate('/checkout')
  }

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-paper shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 p-6">
          <h2 className="font-display text-base font-semibold text-ink">Tu carrito</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-full text-ink/50 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 pt-10">
              <EmptyState message="Tu carrito está vacío." />
              <Link
                to="/"
                onClick={closeCart}
                className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-ink transition-all duration-150 hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <ArrowLeft size={15} /> Seguir comprando
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={(quantity) => updateQuantity(item.product.id, quantity)}
                  onRemove={() => removeItem(item.product.id)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <CartSummary subtotal={subtotal} onClear={clearCart} onCheckout={handleCheckout} onClose={closeCart} />
        )}
      </aside>
    </div>
  )
}
