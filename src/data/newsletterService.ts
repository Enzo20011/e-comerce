import { apiFetch } from '../lib/api'

export interface Subscriber {
  email: string
  subscribedAt: string
}

export function subscribeToNewsletter(email: string): Promise<void> {
  return apiFetch('/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
}

export function getSubscribers(): Promise<Subscriber[]> {
  return apiFetch('/newsletter', { auth: true })
}

export function deleteSubscriber(email: string): Promise<void> {
  return apiFetch(`/newsletter/${encodeURIComponent(email)}`, { method: 'DELETE', auth: true })
}
