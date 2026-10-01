import { apiFetch } from '../lib/api'

export interface ActivityEntry {
  id: number
  action: string
  createdAt: string
  actor: string | null
}

export function getActivity(limit = 50): Promise<ActivityEntry[]> {
  return apiFetch(`/activity?limit=${limit}`, { auth: true })
}
