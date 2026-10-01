import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { products as seedProducts } from '../src/data/products.ts'
import { AUTHOR_NAMES, REVIEW_BODIES, REVIEW_TITLES } from '../src/data/reviewTemplates.ts'
import { generateOrderNumber } from '../src/utils/order.ts'
import type { OrderStatus } from '../src/types/order.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data.db')

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    images TEXT NOT NULL,
    stock INTEGER NOT NULL,
    rating REAL,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    order_number TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    shipping TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    discount_code TEXT,
    discount_amount REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    min_subtotal REAL NOT NULL DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating REAL NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    hidden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    viewed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    subscribed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS currencies (
    code TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    rate REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    is_base INTEGER NOT NULL DEFAULT 0,
    last_updated TEXT NOT NULL
  );
`)

function ensureColumn(table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!columns.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

ensureColumn('orders', 'discount_code', 'TEXT')
ensureColumn('orders', 'discount_amount', 'REAL NOT NULL DEFAULT 0')
ensureColumn('activity_log', 'actor', 'TEXT')
ensureColumn('admin_users', 'failed_attempts', 'INTEGER NOT NULL DEFAULT 0')
ensureColumn('admin_users', 'locked_until', 'INTEGER NOT NULL DEFAULT 0')

export function logActivity(action: string, actor?: string): void {
  db.prepare('INSERT INTO activity_log (action, created_at, actor) VALUES (?, ?, ?)').run(
    action,
    new Date().toISOString(),
    actor ?? null,
  )
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]
}

const RELATIVE_DATES = [
  'hace 2 días',
  'hace 1 semana',
  'hace 2 semanas',
  'hace 1 mes',
  'hace 2 meses',
  'hace 3 meses',
] as const

function seedProductsIfEmpty(): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO products (id, name, description, price, category, image, images, stock, rating, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const product of seedProducts) {
    insert.run(
      product.id,
      product.name,
      product.description,
      product.price,
      product.category,
      product.image,
      JSON.stringify(product.images),
      product.stock,
      product.rating ?? null,
      product.featured ? 1 : 0,
    )
  }
}

function seedReviewsIfEmpty(): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number }
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO reviews (id, product_id, author, rating, date, title, body, hidden)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `)

  for (const product of seedProducts) {
    const baseRating = product.rating ?? 4.5
    const baseHash = hashString(product.id)
    const reviewCount = 3 + (baseHash % 4)

    for (let index = 0; index < reviewCount; index++) {
      const seed = baseHash + index * 97
      const jitter = ((seed % 5) - 2) * 0.25
      const rating = Math.min(5, Math.max(1, Math.round((baseRating + jitter) * 2) / 2))

      insert.run(
        `${product.id}-review-${index}`,
        product.id,
        pick(AUTHOR_NAMES, seed),
        rating,
        pick(RELATIVE_DATES, seed + 13),
        pick(REVIEW_TITLES, seed + 29),
        pick(REVIEW_BODIES, seed + 47),
      )
    }
  }
}

function seedAdminUserIfEmpty(): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const { count } = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number }

  if (count > 0) {
    const row = db.prepare('SELECT password_hash FROM admin_users').all() as { password_hash: string }[]
    if (isProduction && row.some((r) => bcrypt.compareSync('admin', r.password_hash))) {
      throw new Error('Un usuario admin sigue con la contraseña por defecto "admin". Cambiala antes de salir a producción.')
    }
    return
  }

  let password = process.env.ADMIN_PASSWORD
  if (!password) {
    if (isProduction) throw new Error('Definí ADMIN_PASSWORD (mínimo 12 caracteres) para crear el admin inicial.')
    password = randomBytes(9).toString('base64url')
    console.log(`[dev] Admin inicial creado: usuario "admin", contraseña "${password}" (se muestra una sola vez).`)
  }
  if (isProduction && password.length < 12) throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')

  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(
    process.env.ADMIN_USERNAME || 'admin',
    bcrypt.hashSync(password, 12),
  )
}

const FAKE_SHIPPING = {
  name: 'Juan Pérez',
  email: 'juan.perez@example.com',
  address: 'Av. Siempreviva 742',
  city: 'Buenos Aires',
  postalCode: 'C1000',
}

function statusForAge(daysAgo: number): OrderStatus {
  if (daysAgo >= 5) return Math.random() < 0.04 ? 'cancelado' : 'entregado'
  if (daysAgo >= 2) return Math.random() < 0.7 ? 'entregado' : 'enviado'
  return Math.random() < 0.5 ? 'enviado' : 'pendiente'
}

function seedHistoricalOrdersIfEmpty(): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }
  if (count > 0) return

  const products = db.prepare('SELECT * FROM products').all() as {
    id: string
    name: string
    price: number
    image: string
  }[]
  if (products.length === 0) return

  const insert = db.prepare(`
    INSERT INTO orders (order_number, items, subtotal, shipping, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const today = new Date()
  const DAYS_BACK = 150
  let orderIndex = 0

  for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
    const day = new Date(today)
    day.setDate(day.getDate() - daysAgo)

    if (Math.random() >= 0.85) continue

    const isBusyDay = daysAgo % 20 === 0
    const orderCount = isBusyDay ? randomInt(5, 9) : randomInt(1, 4)

    for (let i = 0; i < orderCount; i++) {
      const itemCount = randomInt(1, 3)
      const items = Array.from({ length: itemCount }, () => {
        const product = products[randomInt(0, products.length - 1)]
        return { product: rowToProductSnapshot(product), quantity: randomInt(1, 3) }
      })
      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const createdAt = new Date(day)
      createdAt.setHours(randomInt(8, 21), randomInt(0, 59), 0, 0)

      insert.run(
        `${generateOrderNumber()}-${orderIndex}`,
        JSON.stringify(items),
        subtotal,
        JSON.stringify(FAKE_SHIPPING),
        createdAt.toISOString(),
        statusForAge(daysAgo),
      )
      orderIndex += 1
    }
  }
}

function rowToProductSnapshot(row: { id: string; name: string; price: number; image: string }) {
  return { id: row.id, name: row.name, price: row.price, image: row.image }
}

function seedCouponsIfEmpty(): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number }
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO coupons (code, type, value, active, min_subtotal, usage_limit, used_count, expires_at, created_at)
    VALUES (?, ?, ?, 1, ?, ?, 0, ?, ?)
  `)
  const now = new Date().toISOString()
  insert.run('BIENVENIDO10', 'percent', 10, 0, null, null, now)
  insert.run('10OFF', 'fixed', 10, 50, null, null, now)
}

function seedCurrenciesIfEmpty(): void {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM currencies').get() as { count: number }
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO currencies (code, symbol, rate, active, is_base, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const now = new Date().toISOString()

  // Base ARS (rate = 1.0 — siempre)
  insert.run('ARS', 'AR$', 1.0, 1, 1, now)

  // Tasas aproximadas al dólar blue ~1540 ARS/USD (sep 2026)
  // rate = cuántas unidades de esa moneda vale 1 ARS
  // 1 ARS = 1/1540 USD ≈ 0.000649
  insert.run('USD', 'US$', 1 / 1540,        1, 0, now)
  // EUR: 1 USD ≈ 0.92 EUR → 1 ARS = 0.92/1540 ≈ 0.000597
  insert.run('EUR', '€',   0.92 / 1540,     1, 0, now)
  // BRL: 1 USD ≈ 5.10 BRL → 1 ARS = 5.10/1540 ≈ 0.00331
  insert.run('BRL', 'R$',  5.10 / 1540,     1, 0, now)
  // CLP: 1 USD ≈ 940 CLP → 1 ARS = 940/1540 ≈ 0.610
  insert.run('CLP', 'CLP$', 940 / 1540,     1, 0, now)
  // MXN: 1 USD ≈ 17 MXN → 1 ARS = 17/1540 ≈ 0.01104
  insert.run('MXN', 'MX$', 17 / 1540,       1, 0, now)
}

seedProductsIfEmpty()
seedReviewsIfEmpty()
seedAdminUserIfEmpty()
seedHistoricalOrdersIfEmpty()
seedCouponsIfEmpty()
seedCurrenciesIfEmpty()
