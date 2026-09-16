const TOKEN_KEY = 'ecomerce.admin.token'

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // almacenamiento no disponible
  }
}

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
  if (auth) {
    const token = getAdminToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`/api${path}`, { ...rest, headers: finalHeaders })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json() : undefined

  if (!response.ok) {
    const message = (body as { error?: string } | undefined)?.error ?? 'Ocurrió un error inesperado.'
    throw new ApiError(response.status, message)
  }

  return body as T
}
