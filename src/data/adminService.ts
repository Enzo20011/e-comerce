import { apiFetch } from '../lib/api'
import type { AdminRole } from '../context/AdminAuthContext'

export interface AdminUser {
  username: string
  role: AdminRole
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiFetch('/admin/change-password', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch('/admin/users', { auth: true })
}

export function createAdminUser(input: { username: string; password: string; role: AdminRole }): Promise<AdminUser> {
  return apiFetch('/admin/users', { method: 'POST', auth: true, body: JSON.stringify(input) })
}

export function updateAdminUser(username: string, input: { role?: AdminRole; password?: string }): Promise<void> {
  return apiFetch(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input),
  })
}

export function deleteAdminUser(username: string): Promise<void> {
  return apiFetch(`/admin/users/${encodeURIComponent(username)}`, { method: 'DELETE', auth: true })
}
