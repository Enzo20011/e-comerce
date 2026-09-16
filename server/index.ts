import './env.ts'
import express from 'express'
import cors from 'cors'
import './db.ts'
import { productsRouter } from './routes/products.ts'
import { ordersRouter } from './routes/orders.ts'
import { reviewsRouter } from './routes/reviews.ts'
import { adminRouter } from './routes/admin.ts'
import { newsletterRouter } from './routes/newsletter.ts'
import { couponsRouter } from './routes/coupons.ts'
import { activityRouter } from './routes/activity.ts'

const PORT = Number(process.env.PORT) || 3001

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', productsRouter)
app.use('/api', ordersRouter)
app.use('/api', reviewsRouter)
app.use('/api', adminRouter)
app.use('/api', newsletterRouter)
app.use('/api', couponsRouter)
app.use('/api', activityRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' })
})

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
