import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getCategories, getProductById, updateProduct } from '../../data/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
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
  const categories = getCategories()
  const existing = isEditing ? getProductById(id) : undefined

  useDocumentTitle(isEditing ? 'Admin — Editar producto' : 'Admin — Nuevo producto')

  const [form, setForm] = useState<FormState>(() => toFormState(existing, categories[0]))

  if (isEditing && !existing) {
    return <Navigate to="/admin/products" replace />
  }

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

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

    if (isEditing && id) {
      updateProduct(id, data)
    } else {
      createProduct(data)
    }
    navigate('/admin/products')
  }

  return (
    <div className="max-w-xl">
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
                <option key={category} value={category}>
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
          className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          {isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>
    </div>
  )
}
