'use client';
import { User } from './api';

const AUTH_STORAGE_KEY = 'followflow_auth_session';

export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuthUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('followflow_auth_change', { detail: user }));
  } catch {}
}

export function clearAuthUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('followflow_auth_change', { detail: null }));
  } catch {}
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
