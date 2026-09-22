import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(path.join(__dirname, '..', 'server', 'data.db'))

const now = new Date().toISOString()
const blue = 1540 // promedio compra/venta dolar blue (sep 2026)

const rates: Record<string, number> = {
  USD: 1 / blue,
  EUR: 0.92 / blue,
  BRL: 5.10 / blue,
  CLP: 940 / blue,
  MXN: 17 / blue,
}

const stmt = db.prepare('UPDATE currencies SET rate = ?, last_updated = ? WHERE code = ?')
for (const [code, rate] of Object.entries(rates)) {
  const result = stmt.run(rate, now, code) as { changes: number }
  console.log(`${code}: rate=${rate.toFixed(8)}, changes=${result.changes}`)
}
db.close()
console.log('Done!')
