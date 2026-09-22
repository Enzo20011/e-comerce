import { useEffect, useState } from 'react'
import { Check, Edit2, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '../../lib/api'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { Currency } from '../../context/CurrencyContext'

export function AdminCurrenciesPage() {
  useDocumentTitle('Monedas')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editRate, setEditRate] = useState<string>('')

  useEffect(() => {
    fetchCurrencies()
  }, [])

  async function fetchCurrencies() {
    try {
      const data = await apiFetch<Currency[]>('/currencies/all', { auth: true })
      setCurrencies(data)
    } catch (e) {
      toast.error('Error al cargar monedas')
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await apiFetch<{ success: boolean; updated: number; blueRate?: number; source?: string }>(
        '/currencies/sync',
        { method: 'POST', auth: true },
      )
      const blueInfo = res.blueRate ? ` (Blue: $${res.blueRate.toFixed(0)} ARS/USD)` : ''
      toast.success(`✅ ${res.updated} monedas actualizadas${blueInfo}`)
      await fetchCurrencies()
    } catch (e) {
      toast.error('Error al sincronizar con el mercado')
    } finally {
      setSyncing(false)
    }
  }

  async function handleToggleActive(code: string, active: number) {
    const target = currencies.find(c => c.code === code)
    if (!target || target.is_base) return
    
    try {
      await apiFetch(`/currencies/${code}`, {
        method: 'PUT',
        body: JSON.stringify({ rate: target.rate, active: !active }),
        auth: true,
      })
      toast.success(active ? 'Moneda desactivada' : 'Moneda activada')
      fetchCurrencies()
    } catch (e) {
      toast.error('Error al cambiar estado')
    }
  }

  async function handleSaveRate(code: string) {
    const target = currencies.find(c => c.code === code)
    if (!target) return
    const numRate = parseFloat(editRate)
    if (isNaN(numRate) || numRate <= 0) {
      toast.error('Tasa inválida')
      return
    }

    try {
      await apiFetch(`/currencies/${code}`, {
        method: 'PUT',
        body: JSON.stringify({ rate: numRate, active: target.active === 1 }),
        auth: true,
      })
      toast.success('Tasa de cambio actualizada')
      setEditingCode(null)
      fetchCurrencies()
    } catch (e) {
      toast.error('Error al actualizar tasa')
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Monedas y Divisas</h1>
          <p className="mt-1 text-sm text-ink/60">
            Administrá las tasas de cambio. USD usa el dólar blue (dolarapi.com), el resto usa open.er-api.com. La moneda base es ARS.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Sincronizar tasas reales'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-paper">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/5 text-ink/60">
              <tr>
                <th className="px-6 py-4 font-medium">Moneda</th>
                <th className="px-6 py-4 font-medium">Símbolo</th>
                <th className="px-6 py-4 font-medium">Tasa vs Base (ARS)</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {currencies.map((currency) => (
                <tr key={currency.code} className="transition-colors hover:bg-ink/5">
                  <td className="px-6 py-4 font-medium text-ink">
                    {currency.code} {currency.is_base === 1 && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Base</span>}
                  </td>
                  <td className="px-6 py-4">{currency.symbol}</td>
                  <td className="px-6 py-4">
                    {editingCode === currency.code ? (
                      <input
                        type="number"
                        step="0.000001"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="w-32 rounded-md border border-ink/20 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    ) : (
                      <span className="font-mono">{currency.rate}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {currency.is_base ? (
                      <span className="text-ink/40">Siempre activa</span>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(currency.code, currency.active)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                          currency.active ? 'bg-accent' : 'bg-ink/20'
                        } transition-colors duration-200 ease-in-out`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-paper transition duration-200 ease-in-out shadow-sm ${
                            currency.active ? 'translate-x-2' : '-translate-x-2'
                          }`}
                        />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!currency.is_base && (
                      editingCode === currency.code ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSaveRate(currency.code)} className="text-accent hover:text-accent/80">
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingCode(null)} className="text-error hover:text-error/80">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCode(currency.code)
                            setEditRate(currency.rate.toString())
                          }}
                          className="text-ink/60 hover:text-ink"
                        >
                          <Edit2 size={18} />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
