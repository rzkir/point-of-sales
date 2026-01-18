import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/session
 * Mengembalikan user dari cookie session (httpOnly) atau fallback user.role.
 */
export async function GET(request: NextRequest) {
    const session = request.cookies.get("session")?.value

    if (session) {
        try {
            const user = JSON.parse(session) as User
            if (user?.id && user?.roleType) {
                return NextResponse.json({ success: true, data: user })
            }
        } catch {
            // ignore invalid JSON
        }
    }

    // Fallback: hanya user.role dari client cookie (tanpa session httpOnly)
    const role = request.cookies.get("user.role")?.value
    if (role) {
        return NextResponse.json({
            success: true,
            data: { role, isAuthenticated: true },
        })
    }

    return NextResponse.json({ success: true, data: null })
}

/**
 * DELETE /api/auth/session
 * Menghapus cookie session dan user.role (untuk logout).
 */
export async function DELETE() {
    const res = NextResponse.json({ success: true, message: "Logged out" })
    res.cookies.set("session", "", { path: "/", maxAge: 0 })
    res.cookies.set("user.role", "", { path: "/", maxAge: 0 })
    return res
}
