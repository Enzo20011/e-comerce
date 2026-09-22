import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createProduct, deriveCategories, getAllProducts, getProductById, updateProduct } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Skeleton } from '../../components/common/Skeleton'
import type { Product } from '../../types/product'

interface FormState {
  name: string
  description: string
  price: string
  category: string
  stock: string
  rating: string
  featured: boolean
  images: string
}

function toFormState(product?: Product, fallbackCategory?: string): FormState {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    category: product?.category ?? fallbackCategory ?? '',
    stock: product ? String(product.stock) : '',
    rating: product?.rating !== undefined ? String(product.rating) : '',
    featured: product?.featured ?? false,
    images: product?.images.join(', ') ?? '',
  }
}

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== undefined
  const navigate = useNavigate()

  useDocumentTitle(isEditing ? 'Admin — Editar producto' : 'Admin — Nuevo producto')

  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState<FormState | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const products = await getAllProducts()
      const derivedCategories = deriveCategories(products)
      if (cancelled) return
      setCategories(derivedCategories)

      if (isEditing && id) {
        const existing = await getProductById(id)
        if (cancelled) return
        if (!existing) {
          setNotFound(true)
          return
        }
        setForm(toFormState(existing, derivedCategories[0]))
      } else {
        setForm(toFormState(undefined, derivedCategories[0]))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, isEditing])

  if (notFound) {
    return <Navigate to="/admin/products" replace />
  }

  if (!form) {
    return (
      <div className="max-w-xl">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form) return

    const images = form.images
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)

    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      rating: form.rating ? Number(form.rating) : undefined,
      featured: form.featured,
      images,
      image: images[0] ?? '',
    }

    setSubmitting(true)
    try {
      if (isEditing && id) {
        await updateProduct(id, data)
        toast.success('Producto actualizado')
      } else {
        await createProduct(data)
        toast.success('Producto creado')
      }
      navigate('/admin/products')
    } catch {
      toast.error('No pudimos guardar el producto. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        to="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-accent"
      >
        <ArrowLeft size={15} /> Volver a productos
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink/70">
            Nombre
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink/70">
            Descripción
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-ink/70">
              Precio
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(event) => handleChange('price', event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="stock" className="mb-1 block text-sm font-medium text-ink/70">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(event) => handleChange('stock', event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-ink/70">
              Categoría
            </label>
            <select
              id="category"
              required
              value={form.category}
              onChange={(event) => handleChange('category', event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-surface text-ink">
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rating" className="mb-1 block text-sm font-medium text-ink/70">
              Rating (opcional)
            </label>
            <input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(event) => handleChange('rating', event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="images" className="mb-1 block text-sm font-medium text-ink/70">
            Imágenes (URLs separadas por coma)
          </label>
          <input
            id="images"
            required
            value={form.images}
            onChange={(event) => handleChange('images', event.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => handleChange('featured', event.target.checked)}
            className="h-4 w-4 rounded border-ink/30 accent-[var(--color-accent)]"
          />
          Destacado
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper btn-shine transition-all duration-150 hover:bg-accent hover:shadow-md hover:shadow-accent/25 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>
    </div>
  )
}
