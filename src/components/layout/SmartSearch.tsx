import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../../context/CurrencyContext'
import type { Product } from '../../types/product'

interface SmartSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [searchValue, setSearchValue] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      if (products.length === 0) {
        setIsLoading(true)
        fetch('/api/products')
          .then((res) => res.json())
          .then((data) => setProducts(data.products || data))
          .catch(console.error)
          .finally(() => setIsLoading(false))
      }
    }
  }, [isOpen, products.length])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        // La lógica para abrir se maneja desde un provider o el componente padre
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const suggestions = useMemo(() => {
    const term = searchValue.trim().toLowerCase()
    if (!term) return []
    return products
      .filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
      .slice(0, 5)
  }, [searchValue, products])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}#catalogo`)
      onClose()
      setSearchValue('')
    }
  }

  function handleProductClick(id: string) {
    navigate(`/product/${id}`)
    onClose()
    setSearchValue('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center pt-24 sm:pt-32" onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm -z-10" />
      
      <div className="w-full max-w-2xl bg-paper sm:rounded-2xl shadow-2xl overflow-hidden border border-ink/10 flex flex-col animate-rise-in" style={{ willChange: 'transform, opacity', transition: 'none' }}>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-ink/10 px-4 py-4 sm:px-6 bg-surface">
          <Search size={22} className="shrink-0 text-ink/40" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar productos, categorías..."
            className="flex-1 bg-transparent text-lg text-ink placeholder-ink/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <X size={20} />
          </button>
        </form>

        {searchValue.trim() !== '' && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-8 text-center text-ink/50">Cargando resultados...</div>
            ) : suggestions.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-4 rounded-xl p-2 hover:bg-ink/5 transition-colors text-left group"
                    >
                      <img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover bg-ink/5" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-semibold text-ink group-hover:text-accent transition-colors">{product.name}</span>
                        <span className="text-xs text-ink/50">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-3 pr-2">
                        <span className="font-medium text-ink">{formatPrice(product.price)}</span>
                        <ArrowRight size={16} className="text-ink/30 group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-ink/50">
                No se encontraron productos para "{searchValue}"
              </div>
            )}
          </div>
        )}
        
        <div className="bg-ink/5 px-6 py-3 text-xs text-ink/50 flex items-center justify-between border-t border-ink/10">
          <div className="flex items-center gap-2">
            <span>Abrir Búsqueda Rápida</span>
            <kbd className="rounded border border-ink/20 bg-paper px-1.5 py-0.5 font-sans font-medium text-ink/70">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2">
            <span>Cerrar</span>
            <kbd className="rounded border border-ink/20 bg-paper px-1.5 py-0.5 font-sans font-medium text-ink/70">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
