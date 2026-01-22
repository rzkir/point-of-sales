import { NextRequest, NextResponse } from "next/server"

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"

// Secret untuk otorisasi request ke Apps Script
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

/**
 * GET /api/categories - Get all categories
 */
export async function GET(request: NextRequest) {
    try {
        // Auth (header) untuk akses endpoint ini
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
            return NextResponse.json(
                { success: false, message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local" },
                { status: 500 },
            )
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify({ action: "list", sheet: "Categories" }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500))
            return NextResponse.json(
                { success: false, message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL." },
                { status: 500 },
            )
        }

        const data = await response.json()

        if (!data.success) {
            console.error("Failed to get categories:", data.message)
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 },
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        })
    } catch (error) {
        console.error("Get categories error:", error)
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 },
        )
    }
}

/**
 * POST /api/categories - Create a new category
 */
export async function POST(request: NextRequest) {
    try {
        // Auth (header) untuk akses endpoint ini
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, is_active } = body

        if (!name || String(name).trim() === "") {
            return NextResponse.json(
                { success: false, message: "Category name is required" },
                { status: 400 },
            )
        }

        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
            return NextResponse.json(
                { success: false, message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local" },
                { status: 500 },
            )
        }

        const requestBody = {
            action: "create",
            sheet: "Categories",
            name: String(name).trim(),
            is_active: is_active !== undefined ? Boolean(is_active) : true,
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500))
            return NextResponse.json(
                { success: false, message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL." },
                { status: 500 },
            )
        }

        const data = await response.json()

        if (!data.success) {
            console.error("Create category failed from Apps Script:", data.message)
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 },
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        })
    } catch (error) {
        console.error("Create category error:", error)
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 },
        )
    }
}
