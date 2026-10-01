import '../server/env.ts'
import { backupDatabase } from '../server/backup.ts'

console.log(`Backup creado: ${backupDatabase()}`)
