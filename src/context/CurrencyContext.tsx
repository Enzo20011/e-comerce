import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Currency {
  code: string
  symbol: string
  rate: number
  active: number
  is_base: number
  last_updated: string
}

interface CurrencyContextType {
  currencies: Currency[]
  activeCurrency: Currency | null
  setCurrency: (code: string) => void
  formatPrice: (amountInBase: number) => string
  formatPriceCompact: (amountInBase: number) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [activeCurrencyCode, setActiveCurrencyCode] = useState<string>('ARS') // Default base
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initCurrencies() {
      try {
        const res = await fetch('/api/currencies')
        if (!res.ok) throw new Error('Failed to fetch currencies')
        const data: Currency[] = await res.json()
        setCurrencies(data)

        const saved = localStorage.getItem('user_currency')
        if (saved && data.some(c => c.code === saved)) {
          setActiveCurrencyCode(saved)
        } else {
          // Auto-detect via ipapi
          try {
            const geoRes = await fetch('https://ipapi.co/json/')
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              const detected = geoData.currency
              if (detected && data.some(c => c.code === detected)) {
                setActiveCurrencyCode(detected)
              }
            }
          } catch (e) {
            console.error('Failed to detect geo currency:', e)
          }
        }
      } catch (err) {
        console.error('Currency init error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    initCurrencies()
  }, [])

  const activeCurrency = currencies.find(c => c.code === activeCurrencyCode) || currencies.find(c => c.is_base) || null

  const setCurrency = (code: string) => {
    setActiveCurrencyCode(code)
    localStorage.setItem('user_currency', code)
  }

  const formatPrice = (amountInBase: number) => {
    if (!activeCurrency) {
      // Fallback
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amountInBase)
    }
    
    const converted = amountInBase * activeCurrency.rate
    
    // Choose locale based on currency to format commas/dots correctly
    let locale = 'es-AR'
    if (activeCurrency.code === 'USD') locale = 'en-US'
    if (activeCurrency.code === 'EUR') locale = 'de-DE' // or es-ES
    if (activeCurrency.code === 'MXN') locale = 'es-MX'
    
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: activeCurrency.code,
      maximumFractionDigits: activeCurrency.code === 'ARS' ? 0 : 2
    }).format(converted)
  }

  const formatPriceCompact = (amountInBase: number) => {
    if (!activeCurrency) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact' }).format(amountInBase)
    }
    
    const converted = amountInBase * activeCurrency.rate
    let locale = 'es-AR'
    if (activeCurrency.code === 'USD') locale = 'en-US'
    if (activeCurrency.code === 'EUR') locale = 'de-DE'
    if (activeCurrency.code === 'MXN') locale = 'es-MX'
    
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: activeCurrency.code,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(converted)
  }

  return (
    <CurrencyContext.Provider value={{ currencies, activeCurrency, setCurrency, formatPrice, formatPriceCompact, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
