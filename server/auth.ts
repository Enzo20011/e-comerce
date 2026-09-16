import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? 'dev-only-secret-change-in-production'
const TOKEN_TTL = '12h'

export function signAdminToken(username: string): string {
  return jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'No autorizado.' })
    return
  }

  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }
}
