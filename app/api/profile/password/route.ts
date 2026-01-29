import { NextRequest, NextResponse } from "next/server"

import { checkAuth, validateAppsScriptUrl } from "@/lib/validation"

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

async function callAppsScript(requestBody: Record<string, unknown>) {
    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(requestBody),
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
        await response.text()
        return NextResponse.json(
            {
                success: false,
                message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
            },
            { status: 500 },
        )
    }

    const data = await response.json()

    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message || "Failed to change password" },
            { status: 400 },
        )
    }

    return NextResponse.json({
        success: true,
        message: data.message,
    })
}

export async function POST(request: NextRequest) {
    try {
        const authError = checkAuth(request)
        if (authError) return authError

        const session = request.cookies.get("session")?.value
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, currentPassword, newPassword } = body || {}

        if (!id || !currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, message: "id, currentPassword, dan newPassword wajib diisi" },
                { status: 400 },
            )
        }

        if (String(newPassword).trim().length < 8) {
            return NextResponse.json(
                { success: false, message: "Password baru minimal 8 karakter" },
                { status: 400 },
            )
        }

        const urlError = validateAppsScriptUrl()
        if (urlError) return urlError

        const requestBody = {
            action: "changePassword",
            sheet: "Users",
            id: String(id),
            currentPassword: String(currentPassword),
            newPassword: String(newPassword),
        }

        return await callAppsScript(requestBody)
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 },
        )
    }
}

