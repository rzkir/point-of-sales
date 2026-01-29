import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const session = request.cookies.get("session")?.value

    if (session) {
        try {
            const user = JSON.parse(session) as User
            if (user?.id && user?.roleType) {
                return NextResponse.json({ success: true, data: user })
            }
        } catch {
        }
    }

    const role = request.cookies.get("user.role")?.value
    if (role) {
        return NextResponse.json({
            success: true,
            data: { role, isAuthenticated: true },
        })
    }

    return NextResponse.json({ success: true, data: null })
}

export async function DELETE() {
    const res = NextResponse.json({ success: true, message: "Logged out" })
    res.cookies.set("session", "", { path: "/", maxAge: 0 })
    res.cookies.set("user.role", "", { path: "/", maxAge: 0 })
    return res
}
