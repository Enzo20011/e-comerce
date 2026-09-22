import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCurrency } from '../../context/CurrencyContext'

const CURRENCY_FLAGS: Record<string, string> = {
  ARS: '🇦🇷',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  BRL: '🇧🇷',
  CLP: '🇨🇱',
  MXN: '🇲🇽',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
}

export function CurrencySelector() {
  const { currencies, activeCurrency, setCurrency, isLoading } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (isLoading || !activeCurrency || currencies.length <= 1) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-label={`Moneda actual: ${activeCurrency.code}`}
        aria-expanded={open}
      >
        <span>{CURRENCY_FLAGS[activeCurrency.code] ?? '💱'}</span>
        <span className="hidden sm:inline">{activeCurrency.code}</span>
        <ChevronDown
          size={14}
          className={`text-ink/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] rounded-xl border border-ink/10 bg-paper shadow-lg shadow-ink/10 overflow-hidden animate-in">
          <div className="p-1.5">
            {currencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  c.code === activeCurrency.code
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <span className="text-base leading-none">{CURRENCY_FLAGS[c.code] ?? '💱'}</span>
                <span className="font-medium">{c.code}</span>
                <span className="ml-auto text-xs text-ink/40">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
