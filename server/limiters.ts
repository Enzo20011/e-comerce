import { rateLimit } from 'express-rate-limit'

function limiter(windowMs: number, limit: number, error: string) {
  return rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { error } })
}

export const orderCreateLimiter = limiter(60 * 60 * 1000, 20, 'Demasiados pedidos. Probá más tarde.')
export const orderLookupLimiter = limiter(15 * 60 * 1000, 20, 'Demasiadas consultas. Probá más tarde.')
export const couponLimiter = limiter(15 * 60 * 1000, 30, 'Demasiados intentos con cupones. Probá más tarde.')
export const newsletterLimiter = limiter(60 * 60 * 1000, 10, 'Demasiados intentos. Probá más tarde.')
export const productViewLimiter = limiter(60 * 1000, 60, 'Demasiadas solicitudes.')
export const reviewCreateLimiter = limiter(60 * 60 * 1000, 5, 'Demasiadas reseñas. Probá más tarde.')
