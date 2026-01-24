import { NextRequest, NextResponse } from "next/server"

/**
 * Next.js 16 Proxy (pengganti middleware).
 * - super_admin, admin di / → redirect /dashboard
 * - karyawan di / → redirect /karyawan
 * - karyawan di /dashboard → redirect /karyawan
 * - belum login (tanpa cookie session) akses /dashboard → redirect /
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    // Skip assets & API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next()
    }

    const session = request.cookies.get("session")?.value

    // Prefer role from httpOnly session; fallback ke client cookie user.role
    let sessionUser: { id?: string | number; roleType?: string } | null = null
    if (session) {
        try {
            sessionUser = JSON.parse(session) as { id?: string | number; roleType?: string }
        } catch {
            sessionUser = null
        }
    }

    const role = sessionUser?.roleType ?? request.cookies.get("user.role")?.value

    if (pathname === "/") {
        if (role === "super_admin" || role === "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        if (role === "karyawan") {
            return NextResponse.redirect(new URL("/karyawan", request.url))
        }
    }

    if (pathname.startsWith("/dashboard")) {
        // Belum login: tidak boleh masuk dashboard
        if (!sessionUser?.id) {
            return NextResponse.redirect(new URL("/", request.url))
        }

        // Karyawan: tidak boleh akses dashboard
        if (role === "karyawan") {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    return NextResponse.next()
}
