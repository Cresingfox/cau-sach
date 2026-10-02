import type { Database } from './types';
import { createSeed } from './seed';
import { expireRequests } from './domain';
export const STORAGE_KEY = 'cau-sach:v1';
export function loadDatabase(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === 1 && Array.isArray(data.users) && Array.isArray(data.requests) && Array.isArray(data.offers) && Array.isArray(data.notices) && Array.isArray(data.mails) && data.stock) return expireRequests(data);
    }
  } catch { /* Invalid or blocked browser storage falls back to a fresh demo. */ }
  return createSeed();
}
export function readFlag(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
export function writeFlag(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* App remains usable without persistence. */ } }
