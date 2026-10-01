import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = process.env.BACKUP_DIR ?? path.join(__dirname, 'backups')
const KEEP = Number(process.env.BACKUP_KEEP) || 14

/** Copia consistente de la base (VACUUM INTO) y rotación de las más viejas. */
export function backupDatabase(): string {
  fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 })
  const file = path.join(BACKUP_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`)
  db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`)
  fs.chmodSync(file, 0o600)

  const old = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith('backup-') && name.endsWith('.db'))
    .sort()
    .slice(0, -KEEP)
  for (const name of old) fs.unlinkSync(path.join(BACKUP_DIR, name))
  return file
}

/** Backup al arrancar y cada 24 h. Se desactiva con BACKUP_ENABLED=false. */
export function scheduleBackups(): void {
  if (process.env.BACKUP_ENABLED === 'false') return
  const run = () => {
    try {
      console.log(`Backup creado: ${backupDatabase()}`)
    } catch (error) {
      console.error('Falló el backup:', error)
    }
  }
  run()
  setInterval(run, 24 * 60 * 60 * 1000).unref()
}
