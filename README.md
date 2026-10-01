# Tienda — Plantilla de E-Commerce

Plantilla de e-commerce full-frontend construida con React, TypeScript y Tailwind CSS. Catálogo con búsqueda y filtros en tiempo real, carrito persistente, checkout mock, lista de deseos, modo oscuro y un panel de administración completo con dashboard de ventas — todo con datos mock en `localStorage`, sin backend.

## Features

**Tienda**
- Catálogo con búsqueda instantánea, filtro por categoría y orden (precio, nombre, destacados)
- Grilla bento con producto destacado
- Página de producto con galería de imágenes, reseñas y productos relacionados
- Carrito persistente (drawer) con checkout mock de dos pasos y confirmación de pedido
- Lista de deseos persistente
- Modo claro/oscuro con toggle
- Diseño responsive, animaciones con CSS puro

**Panel admin** (`/admin`)
- Login mock (protege las rutas de admin)
- CRUD de productos (alta, edición, borrado) — se refleja al instante en la tienda
- Listado de pedidos
- Dashboard de ingresos por día / mes / año con gráficos (`recharts`), sembrado con datos históricos de ejemplo

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-router-dom](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/) para íconos
- [recharts](https://recharts.org/) para los gráficos del dashboard

Todos los datos (productos, pedidos, sesión de admin, carrito, favoritos, tema) se persisten en `localStorage`/`sessionStorage` — no hay backend ni base de datos real, pensado como base reutilizable y adaptable a cualquier rubro.

## Empezar

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`.

### Panel admin

`http://localhost:5200/admin`. En desarrollo la contraseña inicial se genera al azar y se imprime una vez en la consola del server (o definila con `ADMIN_PASSWORD`).

### Producción

Variables obligatorias (ver `.env.example`): `NODE_ENV=production`, `ADMIN_JWT_SECRET` (≥32 caracteres), `ADMIN_PASSWORD` (≥12, solo para crear el admin inicial), `CORS_ORIGIN` si el front está en otro dominio y `TRUST_PROXY=1` detrás de un proxy. El server se niega a arrancar con secretos por defecto. Servir siempre por HTTPS.

### Build de producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  types/        Tipos (Product, Cart, Order, Review, Wishlist)
  data/         Datos mock y "servicios" (productService, orderStore, reviewService)
  context/      Cart, Wishlist, Theme, AdminAuth (React Context + useReducer)
  hooks/        useCart, useWishlist, useTheme, useProductFilters, etc.
  components/   Componentes de UI, organizados por área (catalog, cart, checkout, admin, layout)
  pages/        Páginas de la tienda y del panel admin
```
