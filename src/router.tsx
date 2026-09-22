import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './App'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { WishlistPage } from './pages/WishlistPage'
import { ComparePage } from './pages/ComparePage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { RequireAdminAuth } from './components/admin/RequireAdminAuth'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminCustomerDetailPage } from './pages/admin/AdminCustomerDetailPage'
import { AdminNewsletterPage } from './pages/admin/AdminNewsletterPage'
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage'
import { AdminActivityPage } from './pages/admin/AdminActivityPage'
import { AdminOrderPrintPage } from './pages/admin/AdminOrderPrintPage'
import { AdminCurrenciesPage } from './pages/admin/AdminCurrenciesPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/favoritos', element: <WishlistPage /> },
      { path: '/comparar', element: <ComparePage /> },
      { path: '/pedido', element: <TrackOrderPage /> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: (
      <RequireAdminAuth>
        <AdminLayout />
      </RequireAdminAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductFormPage /> },
      { path: 'products/:id/edit', element: <AdminProductFormPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'customers/:email', element: <AdminCustomerDetailPage /> },
      { path: 'newsletter', element: <AdminNewsletterPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'currencies', element: <AdminCurrenciesPage /> },
      { path: 'activity', element: <AdminActivityPage /> },
      { path: 'orders/:id/print', element: <AdminOrderPrintPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
