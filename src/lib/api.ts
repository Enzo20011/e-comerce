export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth, headers, ...rest } = options

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) }
  if (rest.body) finalHeaders['Content-Type'] = 'application/json'
  // La sesión de admin viaja en una cookie HttpOnly; este header es la protección anti-CSRF.
  if (auth) finalHeaders['X-Requested-With'] = 'fetch'

  const response = await fetch(`/api${path}`, { ...rest, headers: finalHeaders, credentials: 'same-origin' })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json() : undefined

  if (!response.ok) {
    // Si la sesión expiró, limpiar token y redirigir al login
    if (response.status === 401 && auth) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    const message = (body as { error?: string } | undefined)?.error ?? 'Ocurrió un error inesperado.'
    throw new ApiError(response.status, message)
  }

  return body as T
}
