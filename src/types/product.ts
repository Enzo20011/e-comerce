export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  images: string[]
  stock: number
  rating?: number
  featured?: boolean
}
