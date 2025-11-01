export const ADMIN_EMAIL = 'admin@gmail.com';

export function isAdmin(email?: string | null) {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}