import { Router } from 'express'
import { db, logActivity } from '../db.ts'
import { z } from 'zod'
import { requireAdmin, requireOwner } from '../auth.ts'

export const currenciesRouter = Router()

const currencyUpdateSchema = z.object({
  rate: z.number().finite().positive().max(1e12),
  active: z.boolean(),
})

interface Currency {
  code: string
  symbol: string
  rate: number
  active: number
  is_base: number
  last_updated: string
}

// GET /api/currencies — monedas activas (para el frontend público)
currenciesRouter.get('/', (_req, res) => {
  try {
    const currencies = db.prepare('SELECT * FROM currencies WHERE active = 1').all() as unknown as Currency[]
    res.json(currencies)
  } catch (error) {
    console.error('Failed to fetch active currencies:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/currencies/all — todas (para admin)
currenciesRouter.get('/all', requireAdmin, (_req, res) => {
  try {
    const currencies = db.prepare('SELECT * FROM currencies ORDER BY is_base DESC, code ASC').all() as unknown as Currency[]
    res.json(currencies)
  } catch (error) {
    console.error('Failed to fetch all currencies:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/currencies/:code — editar tasa / estado
currenciesRouter.put('/:code', requireAdmin, requireOwner, (req, res) => {
  try {
    const code = String(req.params.code)
    const parsed = currencyUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    const { rate, active } = parsed.data

    const stmt = db.prepare(
      'UPDATE currencies SET rate = ?, active = ?, last_updated = ? WHERE code = ? AND is_base = 0',
    )
    const info = stmt.run(rate, active ? 1 : 0, new Date().toISOString(), code)

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Currency not found or cannot edit base currency' })
    }

    logActivity(`Actualizó la moneda ${code} (tasa ${rate}, ${active ? 'activa' : 'inactiva'})`, res.locals.admin)
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to update currency:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/currencies/sync
 *
 * Estrategia de tasas (base = ARS):
 *   rate = precio en moneda extranjera de 1 ARS
 *   → price_ars * rate = price_foreign
 *
 * Para USD usamos el dólar blue de dolarapi.com (promedio compra/venta).
 * Para el resto (EUR, BRL, CLP, MXN, etc.) usamos open.er-api.com
 * que da tasas vs USD y luego convertimos al blue:
 *   rate_code = (1 / blue_ars_per_usd) * (usd_to_code_rate)
 *
 * Ejemplo: EUR, open.er-api dice EUR/USD = 0.92, blue = 1540 ARS/USD
 *   rate_eur = (1 / 1540) * 0.92 = 0.000597...
 *   → 1 ARS = 0.000597 EUR  ✓ (1540 ARS ≈ 0.92 EUR si blue=1540)
 */
currenciesRouter.post('/sync', requireAdmin, requireOwner, async (_req, res) => {
  try {
    // 1. Dólar blue (dolarapi.com — solo Argentina, no requiere API key)
    const blueRes = await fetch('https://dolarapi.com/v1/dolares/blue')
    if (!blueRes.ok) throw new Error('No se pudo obtener cotización blue')
    const blueData = await blueRes.json() as { compra: number; venta: number }
    // Usamos el promedio compra/venta
    const blueArsPerUsd = (blueData.compra + blueData.venta) / 2
    if (!Number.isFinite(blueArsPerUsd) || blueArsPerUsd <= 0) throw new Error('Cotización blue inválida')

    // 2. Tasas internacionales vs USD (open.er-api.com)
    const erRes = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!erRes.ok) throw new Error('No se pudo obtener tasas de cambio internacionales')
    const erData = await erRes.json() as { rates: Record<string, number> }
    const ratesVsUsd = erData.rates // e.g. { EUR: 0.92, BRL: 5.1, ... }

    const now = new Date().toISOString()
    const updateStmt = db.prepare(
      'UPDATE currencies SET rate = ?, last_updated = ? WHERE code = ?',
    )

    const currencies = db.prepare(
      'SELECT code FROM currencies WHERE is_base = 0',
    ).all() as { code: string }[]

    let updatedCount = 0

    for (const { code } of currencies) {
      let newRate: number | null = null

      if (code === 'USD') {
        // 1 ARS en USD usando blue
        newRate = 1 / blueArsPerUsd
      } else if (ratesVsUsd[code]) {
        // Convertimos: 1 ARS = (1/blueArsPerUsd) USD, luego a la moneda destino
        // 1 ARS en CODE = (1 / blueArsPerUsd) * ratesVsUsd[code]
        newRate = (1 / blueArsPerUsd) * ratesVsUsd[code]
      }

      if (newRate !== null && Number.isFinite(newRate) && newRate > 0) {
        updateStmt.run(newRate, now, code)
        updatedCount++
      }
    }

    logActivity(`Sincronizó las tasas de cambio (${updatedCount} monedas)`, res.locals.admin)
    res.json({
      success: true,
      updated: updatedCount,
      blueRate: blueArsPerUsd,
      source: 'dolarapi.com (blue) + open.er-api.com',
    })
  } catch (error) {
    console.error('Failed to sync currencies:', error)
    res.status(500).json({ error: 'Error al sincronizar tasas de cambio' })
  }
})
