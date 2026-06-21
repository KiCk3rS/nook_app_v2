import type { User } from '../types/api';

export function getUserDisplayName(user: User): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  const parts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (parts) return parts;
  return user.email;
}

export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user);
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase();
  }
  const bits = name.split(/\s+/).filter(Boolean);
  if (bits.length >= 2) {
    return `${bits[0].charAt(0)}${bits[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local.charAt(0)}***@${domain}`;
}

export function formatDurationMinutes(minutes?: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
}

export function formatStepCount(count?: number): string {
  const n = count ?? 0;
  return n <= 1 ? `${n} étape` : `${n} étapes`;
}
