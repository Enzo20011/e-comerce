import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartDrawer } from './components/cart/CartDrawer'
import { CompareBar } from './components/compare/CompareBar'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <div key={location.pathname} className="animate-rise-in">
                <Outlet />
              </div>
            </main>
            <Footer />
            <CartDrawer />
            <CompareBar />
          </div>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  )
}
