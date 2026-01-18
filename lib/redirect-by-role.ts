/**
 * Redirect path berdasarkan role user.
 * - super_admin, admin → /dashboard
 * - karyawan → /
 * - role lain → /
 */

const ADMIN_ROLES = ["super_admin", "admin"] as const

export function isAdminRole(roleType: string): boolean {
  return ADMIN_ROLES.includes(roleType as (typeof ADMIN_ROLES)[number])
}

/**
 * Mengembalikan path redirect setelah login berdasarkan role.
 * - super_admin, admin → /dashboard
 * - karyawan → /
 * - role lain → /
 */
export function getRedirectPathForRole(roleType: string): string {
  if (isAdminRole(roleType)) return "/dashboard"
  if (roleType === "karyawan") return "/"
  return "/"
}
