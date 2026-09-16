try {
  process.loadEnvFile()
} catch {
  // No hay .env (se usan las variables de entorno del sistema o los valores por defecto)
}
