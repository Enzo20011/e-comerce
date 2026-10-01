import './env.ts'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import './db.ts'
import { productsRouter } from './routes/products.ts'
import { ordersRouter } from './routes/orders.ts'
import { reviewsRouter } from './routes/reviews.ts'
import { adminRouter } from './routes/admin.ts'
import { newsletterRouter } from './routes/newsletter.ts'
import { couponsRouter } from './routes/coupons.ts'
import { currenciesRouter } from './routes/currencies_router.ts'
import { activityRouter } from './routes/activity.ts'
import { scheduleBackups } from './backup.ts'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === 'production'

const app = express()
app.disable('x-powered-by')

// Detrás de nginx/Caddy/Cloudflare: TRUST_PROXY=1 (cantidad de proxies) para ver la IP real.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY)

// HTTPS obligatorio en producción cuando hay un proxy que termina TLS (TRUST_PROXY).
if (isProduction && process.env.TRUST_PROXY && process.env.FORCE_HTTPS !== 'false') {
  app.use((req, res, next) => {
    if (req.secure || req.path === '/api/health') return next()
    res.redirect(301, `https://${req.headers.host}${req.originalUrl}`)
  })
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
)

// CORS_ORIGIN="https://mitienda.com,https://www.mitienda.com". Sin definir: solo mismo origen
// (en desarrollo el proxy de Vite hace que el navegador no necesite CORS).
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
if (allowedOrigins.length > 0) app.use(cors({ origin: allowedOrigins }))

app.use(express.json({ limit: '50kb' }))

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Probá de nuevo en un minuto.' },
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', productsRouter)
app.use('/api', ordersRouter)
app.use('/api', reviewsRouter)
app.use('/api', adminRouter)
app.use('/api', newsletterRouter)
app.use('/api', couponsRouter)
app.use('/api/currencies', currenciesRouter)
app.use('/api', activityRouter)

// En producción sirve el frontend compilado (npm run build) con las mismas cabeceras de seguridad.
const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (isProduction && fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' })
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as { status?: number })?.status
  if (status && status >= 400 && status < 500) {
    res.status(status).json({ error: 'Solicitud inválida.' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

app.listen(PORT, () => {
  if (isProduction) scheduleBackups()
  console.log(`API escuchando en http://localhost:${PORT}${isProduction ? ' (producción)' : ''}`)
})
