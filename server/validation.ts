import type { NextFunction, Request, Response } from 'express'
import type { z } from 'zod'

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message ?? 'Datos inválidos.' })
      return
    }
    req.body = result.data
    next()
  }
}
