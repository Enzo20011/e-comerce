import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

const isProduction = process.env.NODE_ENV === 'production'
const DEV_SECRET = 'dev-only-secret-change-in-production'
const JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? DEV_SECRET
const TOKEN_TTL = '2h'

if (isProduction && (JWT_SECRET === DEV_SECRET || JWT_SECRET.length < 32)) {
  throw new Error('ADMIN_JWT_SECRET debe estar definido (mínimo 32 caracteres) en producción.')
}

export function signAdminToken(username: string): string {
  return jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: TOKEN_TTL, algorithm: 'HS256' })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'No autorizado.' })
    return
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    res.locals.admin = typeof payload === 'object' ? String(payload.sub ?? '') : ''
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }
}
