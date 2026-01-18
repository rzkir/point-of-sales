import { NextRequest, NextResponse } from "next/server"

/**
 * Next.js 16 Proxy (pengganti middleware).
 * - super_admin, admin di / → redirect /dashboard
 * - karyawan di /dashboard → redirect /
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const role = request.cookies.get("user.role")?.value

    if (pathname === "/") {
        if (role === "super_admin" || role === "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    if (pathname.startsWith("/dashboard") && role === "karyawan") {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}
