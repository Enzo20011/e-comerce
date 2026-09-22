import { useEffect, useState, type FormEvent } from 'react'
import { useCurrency } from '../../context/CurrencyContext'
import { Percent, Plus, Power, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCoupon, deleteCoupon, getCoupons, toggleCoupon } from '../../data/couponService'
import type { Coupon, CouponType } from '../../types/order'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/TableSkeleton'
import { ApiError } from '../../lib/api'



function emptyForm() {
  return { code: '', type: 'percent' as CouponType, value: '', minSubtotal: '', usageLimit: '' }
}

export function AdminCouponsPage() {
  const { formatPrice } = useCurrency()
  useDocumentTitle('Admin — Cupones')

  const [coupons, setCoupons] = useState<Coupon[] | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null)

  useEffect(() => {
    getCoupons().then(setCoupons)
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(form.value)
    if (!form.code.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error('Completá el código y un valor válido.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createCoupon({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value,
        minSubtotal: Number(form.minSubtotal) || 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      })
      setCoupons((current) => [created, ...(current ?? [])])
      setForm(emptyForm())
      toast.success(`Cupón "${created.code}" creado`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No pudimos crear el cupón.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    try {
      const updated = await toggleCoupon(coupon.code)
      setCoupons((current) => current?.map((item) => (item.code === updated.code ? updated : item)) ?? null)
    } catch {
      toast.error('No pudimos actualizar el cupón.')
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteCoupon(pendingDelete.code)
      setCoupons((current) => current?.filter((item) => item.code !== pendingDelete.code) ?? null)
      toast.success('Cupón eliminado')
    } catch {
      toast.error('No pudimos eliminar el cupón.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Cupones</h1>
      <p className="mt-1 text-sm text-ink/50">Creá y administrá los códigos de descuento del checkout.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-ink/10 bg-surface/50 p-4 sm:grid-cols-5 sm:items-end"
      >
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-ink/60">Código</label>
          <input
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            placeholder="VERANO20"
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Tipo</label>
          <select
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({ ...current, type: event.target.value as CouponType }))
            }
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="percent" className="bg-surface text-ink">Porcentaje</option>
            <option value="fixed" className="bg-surface text-ink">Monto fijo</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">
            Valor {form.type === 'percent' ? '(%)' : '(US$)'}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Mínimo compra</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minSubtotal}
            onChange={(event) => setForm((current) => ({ ...current, minSubtotal: event.target.value }))}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-ink/60">Límite de usos</label>
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
              placeholder="Sin límite"
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-[38px] flex-none items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> Crear
          </button>
        </div>
      </form>

      {coupons === null ? (
        <div className="mt-6">
          <TableSkeleton rows={4} columns={4} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="Todavía no creaste ningún cupón." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
          <div className="divide-y divide-ink/10">
            {coupons.map((coupon) => (
              <div key={coupon.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink/5 text-ink/50">
                  {coupon.type === 'percent' ? <Percent size={15} /> : <Tag size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {coupon.code}
                    {!coupon.active && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-medium text-ink/50">
                        Inactivo
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/50">
                    {coupon.type === 'percent' ? `${coupon.value}% de descuento` : `${formatPrice(coupon.value)} de descuento`}
                    {coupon.minSubtotal > 0 && ` · mín. ${formatPrice(coupon.minSubtotal)}`}
                    {' · '}
                    {coupon.usedCount} usado{coupon.usedCount === 1 ? '' : 's'}
                    {coupon.usageLimit !== null && ` de ${coupon.usageLimit}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(coupon)}
                  className={`flex-none rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    coupon.active
                      ? 'bg-accent/10 text-accent hover:bg-accent/20'
                      : 'bg-ink/5 text-ink/50 hover:bg-ink/10'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Power size={12} /> {coupon.active ? 'Activo' : 'Activar'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(coupon)}
                  aria-label={`Eliminar ${coupon.code}`}
                  className="flex-none rounded-full text-ink/40 transition-all duration-150 hover:text-accent active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`¿Eliminar "${pendingDelete.code}"?`}
          description="El cupón dejará de poder usarse en el checkout."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
