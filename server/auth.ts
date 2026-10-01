import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { db } from './db.ts'

export type AdminRole = 'owner' | 'staff'

const isProduction = process.env.NODE_ENV === 'production'
const DEV_SECRET = 'dev-only-secret-change-in-production'
const JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? DEV_SECRET
const TOKEN_TTL_SECONDS = 2 * 60 * 60
const COOKIE_NAME = 'admin_session'

if (isProduction && (JWT_SECRET === DEV_SECRET || JWT_SECRET.length < 32)) {
  throw new Error('ADMIN_JWT_SECRET debe estar definido (mínimo 32 caracteres) en producción.')
}

interface AdminRecord {
  username: string
  role: AdminRole
  token_version: number
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

/** Sesión en cookie HttpOnly: JavaScript del navegador nunca ve el token (un XSS no puede robarlo). */
export function setAdminSession(res: Response, username: string): void {
  const user = db.prepare('SELECT token_version FROM admin_users WHERE username = ?').get(username) as unknown as {
    token_version: number
  }
  const token = jwt.sign({ sub: username, v: user.token_version }, JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
    algorithm: 'HS256',
  })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  })
}

export function clearAdminSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/api' })
}

/** Invalida todas las sesiones abiertas del usuario (logout, cambio de contraseña). */
export function revokeSessions(username: string): void {
  db.prepare('UPDATE admin_users SET token_version = token_version + 1 WHERE username = ?').run(username)
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // Anti-CSRF: además de SameSite=Strict, las escrituras exigen un header que un sitio ajeno no puede enviar.
  if (!SAFE_METHODS.has(req.method) && req.headers['x-requested-with'] !== 'fetch') {
    res.status(403).json({ error: 'Solicitud no permitida.' })
    return
  }

  const token = readCookie(req, COOKIE_NAME)
  if (!token) {
    res.status(401).json({ error: 'No autorizado.' })
    return
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload
    const user = db
      .prepare('SELECT username, role, token_version FROM admin_users WHERE username = ?')
      .get(String(payload.sub)) as unknown as AdminRecord | undefined
    if (!user || user.token_version !== payload.v) throw new Error('revoked')
    res.locals.admin = user.username
    res.locals.role = user.role
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }
}

export function requireOwner(_req: Request, res: Response, next: NextFunction): void {
  if (res.locals.role !== 'owner') {
    res.status(403).json({ error: 'No tenés permisos para esta acción.' })
    return
  }
  next()
}
